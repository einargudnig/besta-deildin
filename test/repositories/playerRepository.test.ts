import { beforeEach, describe, expect, test } from "bun:test";
import type { QueryResult } from "pg";
import { DatabaseError, NotFoundError } from "../../src/errors";
import type { Database } from "../../src/repositories/playerRepository";
import { createPlayerRepository } from "../../src/repositories/playerRepository";

describe("Player Repository", () => {
  const mockPlayer = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    team_id: 1,
    position: "Forward",
    price: 100,
    total_points: 10,
  };

  let mockDb: Database;
  let playerRepository: ReturnType<typeof createPlayerRepository>;

  beforeEach(() => {
    mockDb = {
      query: async (): Promise<QueryResult> => ({
        rows: [],
        rowCount: 0,
        command: "",
        oid: 0,
        fields: [],
      }),
    };
    playerRepository = createPlayerRepository(mockDb);
  });

  describe("findAll", () => {
    test("should return all players", async () => {
      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [mockPlayer],
        rowCount: 1,
        command: "SELECT",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.findAll();

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual([mockPlayer]);
    });

    test("should handle database error", async () => {
      mockDb.query = async () => {
        throw new Error("Database error");
      };

      const result = await playerRepository.findAll();

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(DatabaseError);
    });
  });

  describe("findById", () => {
    test("should return player by id", async () => {
      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [mockPlayer],
        rowCount: 1,
        command: "SELECT",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.findById(1);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockPlayer);
    });

    test("should return NotFoundError when player not found", async () => {
      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [],
        rowCount: 0,
        command: "SELECT",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.findById(1);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(NotFoundError);
    });

    test("should handle database error", async () => {
      mockDb.query = async () => {
        throw new Error("Database error");
      };

      const result = await playerRepository.findById(1);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(DatabaseError);
    });
  });

  describe("create", () => {
    test("should create a new player", async () => {
      const newPlayer = {
        first_name: "John",
        last_name: "Doe",
        team_id: 1,
        position: "Forward",
        price: 100,
        total_points: 10,
      };

      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [mockPlayer],
        rowCount: 1,
        command: "INSERT",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.create(newPlayer);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(mockPlayer);
    });

    test("should handle database error", async () => {
      mockDb.query = async () => {
        throw new Error("Database error");
      };

      const result = await playerRepository.create({
        first_name: "John",
        last_name: "Doe",
        team_id: 1,
        position: "Forward",
        price: 100,
        total_points: 10,
      });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(DatabaseError);
    });
  });

  describe("update", () => {
    test("should update player", async () => {
      const updateData = { first_name: "Updated" };
      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [{ ...mockPlayer, ...updateData }],
        rowCount: 1,
        command: "UPDATE",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.update(1, updateData);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual({ ...mockPlayer, ...updateData });
    });

    test("should handle database error", async () => {
      mockDb.query = async () => {
        throw new Error("Database error");
      };

      const result = await playerRepository.update(1, { first_name: "Updated" });

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(DatabaseError);
    });
  });

  describe("delete", () => {
    test("should delete player", async () => {
      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [],
        rowCount: 1,
        command: "DELETE",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.delete(1);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toBe(true);
    });

    test("should handle database error", async () => {
      mockDb.query = async () => {
        throw new Error("Database error");
      };

      const result = await playerRepository.delete(1);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(DatabaseError);
    });
  });

  describe("getPlayersByTeam", () => {
    test("should return players by team", async () => {
      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [mockPlayer],
        rowCount: 1,
        command: "SELECT",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.getPlayersByTeam(1);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual([mockPlayer]);
    });

    test("should handle database error", async () => {
      mockDb.query = async () => {
        throw new Error("Database error");
      };

      const result = await playerRepository.getPlayersByTeam(1);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(DatabaseError);
    });
  });

  describe("getTopScorers", () => {
    test("should return top scorers", async () => {
      mockDb.query = async (): Promise<QueryResult> => ({
        rows: [mockPlayer],
        rowCount: 1,
        command: "SELECT",
        oid: 0,
        fields: [],
      });

      const result = await playerRepository.getTopScorers(10);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual([mockPlayer]);
    });

    test("should handle database error", async () => {
      mockDb.query = async () => {
        throw new Error("Database error");
      };

      const result = await playerRepository.getTopScorers(10);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(DatabaseError);
    });
  });
}); 