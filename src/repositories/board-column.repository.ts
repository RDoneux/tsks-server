import BoardColumn from '../entities/board-columns/BoardColumn.entity';
import { dataSource } from '../globals/data-source';

export const BoardColumnRepository = dataSource.getRepository(BoardColumn);
