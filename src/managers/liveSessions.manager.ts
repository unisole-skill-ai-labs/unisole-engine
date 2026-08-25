import { liveSessionsRepository } from "../repositories/liveSessions.repository";
import { LiveSession, liveSessions, NewLiveSession } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const liveSessionsManager = {
  async list(): Promise<LiveSession[]> {
    return liveSessionsRepository.list();
  },
  async getById(id: string): Promise<LiveSession> {
    const row = await liveSessionsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<LiveSession> {
    const values = filterColumns(body, liveSessions) as NewLiveSession;
    if (!values.room_code) {
      values.room_code = Math.floor(100000 + Math.random() * 900000).toString();
    }
    values.id = await generateId(liveSessions, "liveSessions", liveSessions.id);
    return liveSessionsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<LiveSession> {
    const values = filterColumns(body, liveSessions) as NewLiveSession;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await liveSessionsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await liveSessionsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
