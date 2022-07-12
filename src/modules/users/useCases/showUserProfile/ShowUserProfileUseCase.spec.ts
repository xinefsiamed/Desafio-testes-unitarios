import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";



let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase

describe("Show User Profile Use Case", () => {

    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository)
    })

    it('Should be able to get a user profile', async() => {
        const user = await createUserUseCase.execute({
            name: 'test',
            email: 'test@test.com',
            password: 'test123'
        })

        const profile = await showUserProfileUseCase.execute(user.id as string)

        expect(profile).toHaveProperty('id')
        expect(profile).toHaveProperty('email')
        expect(profile).toHaveProperty('name')
        expect(profile).toHaveProperty('password')
    })

    it('Should not be able to get a non exists user profile', () => {
        expect(async () => {
            await showUserProfileUseCase.execute('fakeid')
        }).rejects.toBeInstanceOf(ShowUserProfileError)
    })
})