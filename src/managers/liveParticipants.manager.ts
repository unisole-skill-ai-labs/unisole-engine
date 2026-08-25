import { liveParticipantsRepository } from "../repositories/liveParticipants.repository";
import { LiveParticipant, liveParticipants, NewLiveParticipant } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const liveParticipantsManager = {
  async list(): Promise<LiveParticipant[]> {
    return liveParticipantsRepository.list();
  },
  async getById(id: string): Promise<LiveParticipant> {
    const row = await liveParticipantsRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<LiveParticipant> {
    const values = filterColumns(body, liveParticipants) as NewLiveParticipant;
    values.id = await generateId(liveParticipants, "liveParticipants", liveParticipants.id);
    return liveParticipantsRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<LiveParticipant> {
    const values = filterColumns(body, liveParticipants) as NewLiveParticipant;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await liveParticipantsRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await liveParticipantsRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
