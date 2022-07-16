import { Connection } from "typeorm"
import request from 'supertest'

import createConnection from '../../../../database'
import { app } from "../../../../app"

let connection: Connection

describe("Get Balance Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('Should be able to get a user balance', async () => {

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

    const userBalance = await request(app).get('/api/v1/statements/balance').set({
      Authorization: 'Bearer ' + token
    })

    expect(userBalance.body).toHaveProperty('balance')
    expect(userBalance.body).toHaveProperty('statement')
  })
})
