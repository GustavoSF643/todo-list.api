import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { RouteEntity } from "../entities/route.entity";
import { RouteMethodEnum } from "../enums";
import { TypeOrmRouteRepository } from "./typeorm-route.repository";

describe("TypeOrmRouteRepository", () => {
  let repository: TypeOrmRouteRepository;
  const execute = jest
    .fn()
    .mockResolvedValue({ identifiers: [], generatedMaps: [], raw: [] });
  const orIgnore = jest.fn().mockReturnValue({ execute });
  const values = jest.fn().mockReturnValue({ orIgnore });
  const into = jest.fn().mockReturnValue({ values });
  const insert = jest.fn().mockReturnValue({ into });
  const createQueryBuilder = jest.fn().mockReturnValue({ insert });

  beforeEach(async () => {
    jest.clearAllMocks();
    insert.mockReturnValue({ into });
    into.mockReturnValue({ values });
    values.mockReturnValue({ orIgnore });
    orIgnore.mockReturnValue({ execute });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRouteRepository,
        {
          provide: getRepositoryToken(RouteEntity),
          useValue: { createQueryBuilder },
        },
      ],
    }).compile();

    repository = module.get(TypeOrmRouteRepository);
  });

  it("skips database call when routes array is empty", async () => {
    const result = await repository.bulkUpsert([]);

    expect(createQueryBuilder).not.toHaveBeenCalled();
    expect(result).toEqual({ identifiers: [], generatedMaps: [], raw: [] });
  });

  it("inserts routes with orIgnore", async () => {
    await repository.bulkUpsert([
      { method: RouteMethodEnum.GET, path: "/users" },
      { method: RouteMethodEnum.POST, path: "/users" },
    ]);

    expect(createQueryBuilder).toHaveBeenCalled();
    expect(insert).toHaveBeenCalled();
    expect(into).toHaveBeenCalledWith(RouteEntity);
    expect(values).toHaveBeenCalledWith([
      { method: RouteMethodEnum.GET, path: "/users", is_active: true },
      { method: RouteMethodEnum.POST, path: "/users", is_active: true },
    ]);
    expect(orIgnore).toHaveBeenCalled();
    expect(execute).toHaveBeenCalled();
  });
});
