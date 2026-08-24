import { Router } from 'express';
import { getDB } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { generateGemini, hasGeminiKey } from '../utils/gemini.js';

const router = Router();
router.use(requireAuth);
const statuses = new Set(['active', 'completed', 'paused', 'archived']);

function getClient() {
  return {
    chat: {
      completions: {
        create: async options => ({
          choices: [{ message: { content: await generateGemini({
            system: options.messages.find(message => message.role === 'system')?.content,
            messages: options.messages.filter(message => message.role !== 'system'),
            json: Boolean(options.response_format),
            maxTokens: options.max_tokens,
            temperature: options.temperature,
          }) } }],
        }),
      },
    },
  };
}
function dateIsValid(value) { return !value || /^\d{4}-\d{2}-\d{2}$/.test(value); }
function parseJson(text) {
  try { return JSON.parse(text); } catch {
    const match = text?.match(/\{[\s\S]*\}/);
    try { return match ? JSON.parse(match[0]) : null; } catch { return null; }
  }
}
async function getGoal(db, id, userId) {
  const result = await db.query('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rows[0];
}
async function refreshProgress(db, goalId, userId) {
  await db.query(`UPDATE goals SET progress = COALESCE(
    (SELECT ROUND(AVG(progress)) FROM goal_milestones WHERE goal_id = goals.id),
    (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(100.0 * COUNT(*) FILTER (WHERE completed) / COUNT(*)) END FROM tasks WHERE goal_id = goals.id), 0),
    updated_at = NOW() WHERE id = $1 AND user_id = $2`, [goalId, userId]);
  await db.query(`UPDATE goals SET status = 'completed', updated_at = NOW() WHERE id = $1 AND user_id = $2 AND progress = 100`, [goalId, userId]);
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await getDB().query(`SELECT g.*, (SELECT COUNT(*) FROM tasks t WHERE t.goal_id = g.id) AS task_count,
      (SELECT COUNT(*) FROM tasks t WHERE t.goal_id = g.id AND t.completed) AS completed_task_count,
      (SELECT title FROM goal_milestones m WHERE m.goal_id = g.id AND m.status <> 'completed' ORDER BY m.order_index LIMIT 1) AS current_milestone
      FROM goals g WHERE g.user_id = $1 ORDER BY CASE g.status WHEN 'active' THEN 0 ELSE 1 END, g.deadline NULLS LAST, g.created_at DESC`, [req.userId]);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const goal = await getGoal(db, req.params.id, req.userId);
    if (!goal) return res.status(404).json({ error: 'Maqsad topilmadi.' });
    await refreshProgress(db, goal.id, req.userId);
    const [fresh, milestones, tasks] = await Promise.all([
      getGoal(db, goal.id, req.userId),
      db.query('SELECT * FROM goal_milestones WHERE goal_id = $1 ORDER BY order_index, id', [goal.id]),
      db.query('SELECT * FROM tasks WHERE goal_id = $1 AND user_id = $2 ORDER BY due_date NULLS LAST, created_at DESC', [goal.id, req.userId]),
    ]);
    res.json({ ...fresh, milestones: milestones.rows, tasks: tasks.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  const { title, description = '', reason = '', start_date, deadline, current_state = '', target_state = '', daily_minutes = 60, weekly_days = 5, ai_generated = false, strategy = '', milestones = [] } = req.body;
  const minutes = Number(daily_minutes), days = Number(weekly_days);
  if (!title?.trim()) return res.status(400).json({ error: 'Maqsad nomi bo\'sh bo\'lmasligi kerak.' });
  if (!dateIsValid(start_date) || !dateIsValid(deadline) || (start_date && deadline && start_date > deadline)) return res.status(400).json({ error: 'Sanalar noto\'g\'ri.' });
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440 || !Number.isInteger(days) || days < 1 || days > 7) return res.status(400).json({ error: 'Kunlik vaqt yoki hafta kunlari noto\'g\'ri.' });
  try {
    const db = getDB();
    await db.query('BEGIN');
    const result = await db.query(`INSERT INTO goals (user_id, title, description, reason, start_date, deadline, current_state, target_state, daily_minutes, weekly_days, ai_generated, strategy)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [req.userId, title.trim(), description, reason, start_date || null, deadline || null, current_state, target_state, minutes, days, Boolean(ai_generated), strategy]);
    const goal = result.rows[0];
    for (const [index, milestone] of (Array.isArray(milestones) ? milestones : []).entries()) {
      if (milestone?.title?.trim()) await db.query('INSERT INTO goal_milestones (goal_id, title, description, order_index, deadline, estimated_hours) VALUES ($1,$2,$3,$4,$5,$6)', [goal.id, milestone.title.trim(), milestone.description || '', Number(milestone.order_index) || index + 1, dateIsValid(milestone.deadline) ? milestone.deadline || null : null, Math.max(0, Number(milestone.estimated_hours) || 0)]);
    }
    await db.query('COMMIT');
    res.status(201).json({ ...goal, milestones: (await db.query('SELECT * FROM goal_milestones WHERE goal_id = $1 ORDER BY order_index', [goal.id])).rows });
  } catch (err) { try { await getDB().query('ROLLBACK'); } catch {} res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  const allowed = ['title', 'description', 'reason', 'start_date', 'deadline', 'status', 'current_state', 'target_state', 'daily_minutes', 'weekly_days'];
  try {
    const db = getDB();
    if (!(await getGoal(db, req.params.id, req.userId))) return res.status(404).json({ error: 'Maqsad topilmadi.' });
    const values = allowed.map(key => req.body[key] ?? null);
    if (req.body.status && !statuses.has(req.body.status)) return res.status(400).json({ error: 'Status noto\'g\'ri.' });
    const { rows } = await db.query(`UPDATE goals SET title=COALESCE($1,title), description=COALESCE($2,description), reason=COALESCE($3,reason), start_date=COALESCE($4,start_date), deadline=COALESCE($5,deadline), status=COALESCE($6,status), current_state=COALESCE($7,current_state), target_state=COALESCE($8,target_state), daily_minutes=COALESCE($9,daily_minutes), weekly_days=COALESCE($10,weekly_days), updated_at=NOW() WHERE id=$11 AND user_id=$12 RETURNING *`, [...values, req.params.id, req.userId]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try { const result = await getDB().query('DELETE FROM goals WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]); if (!result.rowCount) return res.status(404).json({ error: 'Maqsad topilmadi.' }); res.json({ message: 'Maqsad o\'chirildi.' }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id/milestones', async (req, res) => {
  try { if (!(await getGoal(getDB(), req.params.id, req.userId))) return res.status(404).json({ error: 'Maqsad topilmadi.' }); const { rows } = await getDB().query('SELECT * FROM goal_milestones WHERE goal_id=$1 ORDER BY order_index,id', [req.params.id]); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/:id/milestones', async (req, res) => {
  const { title, description = '', order_index = 0, deadline, estimated_hours = 0 } = req.body;
  try { const db = getDB(); if (!(await getGoal(db, req.params.id, req.userId))) return res.status(404).json({ error: 'Maqsad topilmadi.' }); if (!title?.trim() || !dateIsValid(deadline) || Number(estimated_hours) < 0) return res.status(400).json({ error: 'Milestone ma\'lumotlari noto\'g\'ri.' }); const { rows } = await db.query('INSERT INTO goal_milestones (goal_id,title,description,order_index,deadline,estimated_hours) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [req.params.id, title.trim(), description, order_index, deadline || null, Number(estimated_hours) || 0]); res.status(201).json(rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id/milestones/:milestoneId', async (req, res) => {
  try { const db = getDB(); const { rows } = await db.query(`UPDATE goal_milestones m SET title=COALESCE($1,title), description=COALESCE($2,description), status=COALESCE($3,status), progress=COALESCE($4,progress), deadline=COALESCE($5,deadline), updated_at=NOW() FROM goals g WHERE m.id=$6 AND m.goal_id=g.id AND g.id=$7 AND g.user_id=$8 RETURNING m.*`, [req.body.title ?? null, req.body.description ?? null, req.body.status ?? null, req.body.progress ?? null, req.body.deadline ?? null, req.params.milestoneId, req.params.id, req.userId]); if (!rows.length) return res.status(404).json({ error: 'Milestone topilmadi.' }); await refreshProgress(db, req.params.id, req.userId); res.json(rows[0]); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id/tasks', async (req, res) => {
  try { if (!(await getGoal(getDB(), req.params.id, req.userId))) return res.status(404).json({ error: 'Maqsad topilmadi.' }); const { rows } = await getDB().query('SELECT * FROM tasks WHERE goal_id=$1 AND user_id=$2 ORDER BY due_date NULLS LAST, created_at DESC', [req.params.id, req.userId]); res.json(rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/generate-plan', async (req, res) => {
  try {
    if (!hasGeminiKey()) return res.status(503).json({ error: 'AI xizmati sozlanmagan. GEMINI_API_KEY mavjud emas.' });
    const goal = await getGoal(getDB(), req.params.id, req.userId); if (!goal) return res.status(404).json({ error: 'Maqsad topilmadi.' });
    const response = await getClient().chat.completions.create({ model: 'llama-3.1-8b-instant', temperature: 0.4, max_tokens: 1200, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Return valid JSON only: {strategy:string,milestones:[{title:string,description:string,order_index:number,deadline:string}]}.' }, { role: 'user', content: JSON.stringify(goal) }] });
    const plan = parseJson(response.choices[0].message.content); if (!plan || !Array.isArray(plan.milestones)) return res.status(502).json({ error: 'AI rejasi noto\'g\'ri formatda.' });
    const db = getDB(); await db.query('UPDATE goals SET strategy=$1, ai_generated=true, updated_at=NOW() WHERE id=$2 AND user_id=$3', [String(plan.strategy || ''), goal.id, req.userId]);
    for (const [index, item] of plan.milestones.entries()) if (item?.title) await db.query('INSERT INTO goal_milestones (goal_id,title,description,order_index,deadline,estimated_hours) VALUES ($1,$2,$3,$4,$5,$6)', [goal.id, String(item.title).slice(0, 200), String(item.description || ''), Number(item.order_index) || index + 1, dateIsValid(item.deadline) ? item.deadline || null : null, Math.max(0, Number(item.estimated_hours) || 0)]);
    res.json({ strategy: plan.strategy || '', milestones: (await db.query('SELECT * FROM goal_milestones WHERE goal_id=$1 ORDER BY order_index', [goal.id])).rows });
  } catch (err) {
    console.error('Goal plan error:', err.message);
    if (err.status === 400 || err.status === 401 || err.status === 403 || err.code === 'API_KEY_INVALID' || err.code === 'UNAUTHENTICATED' || err.code === 'PERMISSION_DENIED') return res.status(503).json({ error: 'GEMINI_API_KEY yaroqsiz. Backend .env faylidagi AI kalitni yangilang.' });
    res.status(502).json({ error: 'AI reja tuza olmadi.' });
  }
});

router.post('/:id/plan-day', async (req, res) => {
  try {
    if (!hasGeminiKey()) return res.status(503).json({ error: 'AI xizmati sozlanmagan. GEMINI_API_KEY mavjud emas.' });
    const db = getDB(); const goal = await getGoal(db, req.params.id, req.userId); if (!goal) return res.status(404).json({ error: 'Maqsad topilmadi.' }); if (goal.status !== 'active') return res.status(400).json({ error: 'Yakunlangan yoki pauzadagi maqsad uchun reja tuzib bo\'lmaydi.' });
    const date = req.body.date || new Date().toISOString().slice(0, 10); if (!dateIsValid(date)) return res.status(400).json({ error: 'Sana noto\'g\'ri.' });
    const existingPlan = await db.query('SELECT * FROM goal_daily_plans WHERE goal_id=$1 AND user_id=$2 AND plan_date=$3 AND status <> $4', [goal.id, req.userId, date, 'replaced']);
    if (existingPlan.rows.length && !req.body.replace) return res.json({ ...existingPlan.rows[0], tasks: existingPlan.rows[0].tasks, reused: true });
    if (req.body.replace) await db.query("UPDATE goal_daily_plans SET status='replaced', updated_at=NOW() WHERE goal_id=$1 AND user_id=$2 AND plan_date=$3 AND status <> 'confirmed'", [goal.id, req.userId, date]);
    const milestones = (await db.query('SELECT id,title,progress FROM goal_milestones WHERE goal_id=$1 ORDER BY order_index', [goal.id])).rows;
    const [existingTasks, events, previousGoalTasks] = await Promise.all([
      db.query('SELECT text,priority,completed FROM tasks WHERE user_id=$1 AND due_date=$2', [req.userId, date]),
      db.query('SELECT title,time FROM calendar_events WHERE user_id=$1 AND date=$2', [req.userId, date]),
      db.query('SELECT text,completed,due_date,duration_minutes FROM tasks WHERE user_id=$1 AND goal_id=$2 ORDER BY due_date DESC LIMIT 30', [req.userId, goal.id]),
    ]);
    const response = await getClient().chat.completions.create({ model: 'llama-3.1-8b-instant', temperature: 0.4, max_tokens: 1000, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'You are a realistic personal productivity planner. Return valid JSON only: {date:string,summary:string,tasks:[{text:string,description:string,duration_minutes:number,priority:"high"|"medium"|"low",milestone_id:number,start_time:string,end_time:string}]}. Never exceed available_minutes, avoid calendar conflicts, create 1-5 tasks, prioritize the current milestone, and adapt from completed and incomplete previous tasks.' }, { role: 'user', content: JSON.stringify({ goal, milestones, date, available_minutes: goal.daily_minutes, existing_tasks: existingTasks.rows, calendar_events: events.rows, previous_goal_tasks: previousGoalTasks.rows }) }] });
    const plan = parseJson(response.choices[0].message.content); if (!plan || !Array.isArray(plan.tasks)) return res.status(502).json({ error: 'AI kunlik reja formatini tanimadi.' });
    const previewTasks = []; let total = 0;
    for (const task of plan.tasks.slice(0, 5)) { const duration = Math.max(1, Number(task.duration_minutes) || 0); const text = String(task.text || task.title || '').trim(); if (!text || total + duration > goal.daily_minutes * 1.15) continue; const milestone = milestones.find(item => item.id === Number(task.milestone_id)); previewTasks.push({ text: text.slice(0, 500), description: String(task.description || '').slice(0, 500), duration_minutes: duration, priority: ['high','medium','low'].includes(task.priority) ? task.priority : 'medium', start_time: task.start_time || null, end_time: task.end_time || null, milestone_id: milestone?.id || null }); total += duration; }
    const saved = await db.query(`INSERT INTO goal_daily_plans (goal_id,user_id,plan_date,available_minutes,planned_minutes,summary,tasks,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,'preview') ON CONFLICT (goal_id,plan_date) DO UPDATE SET available_minutes=EXCLUDED.available_minutes, planned_minutes=EXCLUDED.planned_minutes, summary=EXCLUDED.summary, tasks=EXCLUDED.tasks, status='preview', updated_at=NOW() RETURNING *`, [goal.id, req.userId, date, goal.daily_minutes, total, String(plan.summary || plan.message || '').slice(0, 500), JSON.stringify(previewTasks)]);
    res.json(saved.rows[0]);
  } catch (err) {
    console.error('Daily plan error:', err.message);
    if (err.status === 400 || err.status === 401 || err.status === 403 || err.code === 'API_KEY_INVALID' || err.code === 'UNAUTHENTICATED' || err.code === 'PERMISSION_DENIED') return res.status(503).json({ error: 'GEMINI_API_KEY yaroqsiz. Backend .env faylidagi AI kalitni yangilang.' });
    res.status(502).json({ error: 'Bugungi reja tuzilmadi.' });
  }
});

router.post('/:id/plan-day/:planId/confirm', async (req, res) => {
  try {
    const db = getDB();
    const goal = await getGoal(db, req.params.id, req.userId);
    if (!goal) return res.status(404).json({ error: 'Maqsad topilmadi.' });
    const planResult = await db.query("SELECT * FROM goal_daily_plans WHERE id=$1 AND goal_id=$2 AND user_id=$3 AND status='preview'", [req.params.planId, goal.id, req.userId]);
    if (!planResult.rows.length) return res.status(404).json({ error: 'Tasdiqlanadigan reja topilmadi.' });
    const plan = planResult.rows[0];
    await db.query('BEGIN');
    const created = [];
    for (const task of (Array.isArray(plan.tasks) ? plan.tasks : []).slice(0, 5)) {
      const result = await db.query('INSERT INTO tasks (user_id,text,category,due_date,priority,start_time,end_time,goal_id,milestone_id,ai_generated,duration_minutes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10) RETURNING *', [req.userId, task.text, 'O\'qish', plan.plan_date, task.priority, task.start_time, task.end_time, goal.id, task.milestone_id || null, Math.max(1, Number(task.duration_minutes) || 1)]);
      created.push(result.rows[0]);
    }
    await db.query("UPDATE goal_daily_plans SET status='confirmed', updated_at=NOW() WHERE id=$1", [plan.id]);
    await db.query('COMMIT');
    res.json({ plan: { ...plan, status: 'confirmed' }, tasks: created });
  } catch (err) { try { await getDB().query('ROLLBACK'); } catch {} res.status(500).json({ error: 'Reja tasdiqlanmadi.' }); }
});

export default router;
