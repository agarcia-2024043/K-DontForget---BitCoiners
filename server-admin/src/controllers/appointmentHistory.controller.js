import historyService from "../services/appointmentHistory.service.js";
import logger from "../config/logger.js";

export const createHistory = async (req, res, next) => {
  try {
    const { appointmentId, action } = req.body;

    const history = await historyService.createHistory({
      appointmentId,
      action,
      performedBy: req.user.id,
    });

    logger.info(`History created: ${action}`);

    res.status(201).json(history);

  } catch (error) {
    logger.error(error.message);
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const history = await historyService.getHistoryByAppointment(req.params.id);
    res.json(history);

  } catch (error) {
    logger.error(error.message);
    next(error);
  }
};