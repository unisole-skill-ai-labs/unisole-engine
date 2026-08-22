import { certificatesRepository } from "../repositories/certificates.repository";
import { Certificate, NewCertificate, certificates } from "../db/schema";
import { NotFoundError, ValidationError } from "../errors";
import { filterColumns } from "../helpers/filterColumns";
import { generateId } from "../helpers/generateId";

export const certificatesManager = {
  async list(): Promise<Certificate[]> {
    return certificatesRepository.list();
  },
  async getById(id: string): Promise<Certificate> {
    const row = await certificatesRepository.getById(id);
    if (!row) throw new NotFoundError();
    return row;
  },
  async create(body: Record<string, unknown>): Promise<Certificate> {
    const values = filterColumns(body, certificates) as NewCertificate;
    values.id = await generateId(certificates, "certificates", certificates.id);
    return certificatesRepository.create(values);
  },
  async update(id: string, body: Record<string, unknown>): Promise<Certificate> {
    const values = filterColumns(body, certificates) as NewCertificate;
    if (Object.keys(values).length === 0) {
      throw new ValidationError("No valid fields provided");
    }
    const row = await certificatesRepository.update(id, values);
    if (!row) throw new NotFoundError();
    return row;
  },
  async remove(id: string): Promise<void> {
    const row = await certificatesRepository.remove(id);
    if (!row) throw new NotFoundError();
  },
};
