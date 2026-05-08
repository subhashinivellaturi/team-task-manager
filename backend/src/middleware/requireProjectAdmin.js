import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const requireProjectAdmin = async (req, res, next) => {
  const projectId = req.params.id || req.body.projectId;
  const userId = req.user.userId;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.ownerId === userId) return next();

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};