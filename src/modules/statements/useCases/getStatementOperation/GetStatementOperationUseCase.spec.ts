import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}


let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase


describe("Get Statement Operation Use Case", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementRepository)
  })

  it("Should be able to get a statement operation from a user", async () => {
    const user = await createUserUseCase.execute({
      name: 'Test',
      email: 'test@test.com',
      password: 'test123'
    })

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'deposit' as OperationType,
      amount: 100,
      description: 'Test deposit'
    })

    const statement = await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: deposit.id as string })

    expect(statement).toHaveProperty('id')
    expect(statement).toHaveProperty('type')
    expect(statement).toHaveProperty('amount')
    expect(statement.type).toBe('deposit')
    expect(statement.amount).toBe(100)
  })

  it("Should not be able to get a statement operation from a non-existent user", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Test',
        email: 'test@test.com',
        password: 'test123'
      })


      await getStatementOperationUseCase.execute({ user_id: "notUserID", statement_id: "wrongStatement" })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })


  it("Shoud not be able to get a non-existent statement operation", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Test',
        email: 'test@test.com',
        password: 'test123'
      })

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: 'deposit' as OperationType,
        amount: 100,
        description: 'Test deposit'
      })

      await getStatementOperationUseCase.execute({ user_id: user.id as string, statement_id: "noID" })

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
