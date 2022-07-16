import { Connection } from "typeorm"
import request from 'supertest'

import createConnection from '../../../../database'
import { app } from "../../../../app"

let connection: Connection

describe("Create Statement Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to create a deposit', async () => {

    await request(app).post('/api/v1/users').send({
      name: 'test',
      email: 'test@test.com',
      password: 'password'
    })

    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: 'password'
    })

    const { token } = tokenResponse.body

    const depositResponse = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test deposit'
    }).set({
      Authorization: 'Bearer ' + token
    })

    const balanceResponse = await request(app).get('/api/v1/statements/balance').set({
      Authorization: 'Bearer ' + token
    })


    expect(depositResponse.status).toBe(201)
    expect(balanceResponse.body.balance).toBe(100)
  })

  it("Should not be able to create a deposit without authorization", async () => {
    const depositResponse = await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test deposit'
    })

    expect(depositResponse.status).toBe(401)
    expect(depositResponse.body.message).toBe('JWT token is missing!')
  })
})
