import Board from '../entities/board/board.entity';
import { dataSource } from '../globals/data-source';

export const BoardRepository = dataSource.getRepository(Board);
