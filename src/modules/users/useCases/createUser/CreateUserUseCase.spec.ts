import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";


let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User Use Case', () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
    })

    it("Should be able to create a new user", async () => {

        const user = await createUserUseCase.execute({
            name: "Test",
            email: "test@test.com",
            password: "test123"
        })

        expect(user).toHaveProperty("id")
    })

    it("should not be able to create a user with an email exists", () => {
        expect(async () => {
            await createUserUseCase.execute({
                name: "Test",
                email: "test@test.com",
                password: "test123"
            })
            
            await createUserUseCase.execute({
                name: "another test",
                email: "test@test.com",
                password: "test123546"
            })
        }).rejects.toBeInstanceOf(CreateUserError)
    })
})