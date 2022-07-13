import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";


let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

describe("Authenticate User Use Case", () => {

  const user = {
    name: 'test',
    email: 'test@test.com',
    password: 'test123'
  }

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  })

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    })

    const authenticateUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    })


    expect(authenticateUser).toHaveProperty("token")
  })

  it("Should not be able to authenticate a user with an incorrect password", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      })

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'wrongPassword'
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("Should not be able to authenticate a user with an incorrect email", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      })

      await authenticateUserUseCase.execute({
        email: 'wrongEmail@email.com',
        password: user.password
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
