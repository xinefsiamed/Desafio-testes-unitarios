import { Connection } from "typeorm"
import request from 'supertest'


import { app } from "../../../../app"
import createConnection from '../../../../database'


let connection: Connection

describe("Create User Controller", () => {

  beforeAll(async () => {
    connection = await createConnection()

    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("Should be able to create a new user", async () => {

    const response = await request(app).post('/api/v1/users').send({
      name: 'Test',
      email: 'test@test.com',
      password: 'password'
    })

    expect(response.status).toBe(201)
  })


  it("Should not be able to craete a new user with an email address already exists", async () => {

    await request(app).post('/api/v1/users').send({
      name: 'Test',
      email: 'test@test.com',
      password: 'password'
    })

    const response = await request(app).post('/api/v1/users').send({
      name: 'Another Test',
      email: 'test@test.com',
      password: 'password454'
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toEqual('User already exists')
  })
})
