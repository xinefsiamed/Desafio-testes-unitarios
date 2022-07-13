import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}


let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

describe("Get Balance Use Case", () => {

  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it("Should be able to get a user balance", async () => {
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

    const userBalance = await getBalanceUseCase.execute({ user_id: user.id as string })

    expect(userBalance).toHaveProperty('balance')
    expect(userBalance.balance).toBe(100)
  })

  it("Should not be able to get a balance for a non exists user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "uuid-asdas-asd54da" })
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})
