import { BadRequestException, Logger } from '@nestjs/common';

export const CRUDExceptionWrapper = async (fn: () => Promise<any>) => {
  const logger = new Logger(CRUDExceptionWrapper.name);

  try {
    return await fn();
  } catch (e) {
    if (e.code === 11000) {
      // Duplicate unique key
      throw new BadRequestException(e.message);
    } else if (e.message && e.message.startsWith('Cast to ObjectId failed')) {
      throw new BadRequestException(e.message);
    } else if (e.name === 'ValidationError') {
      throw new BadRequestException(e.message);
    } else {
      logger.error(e.message);
      throw e;
    }
  }
};
