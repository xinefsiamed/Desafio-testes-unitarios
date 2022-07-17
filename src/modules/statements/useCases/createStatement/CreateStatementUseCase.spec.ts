import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryStatementsRepository: InMemoryStatementsRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase
let getBalanceUseCase: GetBalanceUseCase

describe("Create Statement Use case", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  })


  it("Should be able to create a deposit", async () => {

    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: 'password'
    })

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'deposit' as OperationType,
      amount: 100,
      description: "Test deposit"
    })

    const userBalance = await getBalanceUseCase.execute({ user_id: user.id as string })


    expect(deposit).toHaveProperty("id");
    expect(userBalance.balance).toBe(100);
  });


  it("Should be able to create a withdraw", async () => {
    const user = await createUserUseCase.execute({
      name: 'test',
      email: 'test@test.com',
      password: 'password'
    })

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'deposit' as OperationType,
      amount: 100,
      description: "Test deposit"
    })

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: 'withdraw' as OperationType,
      amount: 50,
      description: 'Pagar o pleisteixom'
    })

    const userBalance = await getBalanceUseCase.execute({ user_id: user.id as string })


    expect(withdraw).toHaveProperty("id");
    expect(userBalance.balance).toBe(50);
  });

  it("Should not be able to create a statement for a non exists user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "uuid",
        type: 'deposit' as OperationType,
        amount: 100,
        description: "Test deposit"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it("Should not be able to withdraw with insufficients funds", () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'test',
        email: 'test@test.com',
        password: 'password'
      })

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: 'withdraw' as OperationType,
        amount: 100,
        description: "Test withdraw"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
