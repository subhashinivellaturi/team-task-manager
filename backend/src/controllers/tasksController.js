import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    const userId = req.user.userId;

    const where = projectId ? { projectId } : {
      project: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ success: false, message: 'Title and projectId are required' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: assigneeId || null,
        projectId
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } }
      }
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } }
    });

    const isAdmin = task.project.ownerId === userId || member?.role === 'admin';

    let updateData;
    if (isAdmin) {
      const { title, description, status, priority, dueDate, assigneeId } = req.body;
      updateData = { title, description, status, priority, assigneeId,
        dueDate: dueDate ? new Date(dueDate) : null };
    } else {
      if (task.assigneeId !== userId) {
        return res.status(403).json({ success: false, message: 'You can only update your own tasks' });
      }
      updateData = { status: req.body.status };
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};