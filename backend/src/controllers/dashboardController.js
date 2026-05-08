import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const projectWhere = {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }]
    };

    const [totalProjects, totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, recentTasks] =
      await Promise.all([
        prisma.project.count({ where: projectWhere }),
        prisma.task.count({ where: { project: projectWhere } }),
        prisma.task.count({ where: { project: projectWhere, status: 'TODO' } }),
        prisma.task.count({ where: { project: projectWhere, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { project: projectWhere, status: 'DONE' } }),
        prisma.task.findMany({
          where: {
            project: projectWhere,
            dueDate: { lt: new Date() },
            status: { not: 'DONE' }
          },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } }
          },
          orderBy: { dueDate: 'asc' },
          take: 10
        }),
        prisma.task.findMany({
          where: { project: projectWhere },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        totalTasks,
        tasksByStatus: { TODO: todoTasks, IN_PROGRESS: inProgressTasks, DONE: doneTasks },
        overdueTasks,
        recentTasks
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};