import { Connection } from "typeorm"
import request from 'supertest'

import { v4 as uuidv4 } from 'uuid'

import createConnection from '../../../../database'
import { app } from "../../../../app"

let connection: Connection


describe("Get Statement Operation Controller", () => {

  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it("Should be able to get a statement operation by id", async () => {
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

    const { id } = depositResponse.body

    const statementResponse = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: 'Bearer ' + token
    })

    expect(statementResponse.body).toHaveProperty('id')
    expect(statementResponse.body).toHaveProperty('user_id')
    expect(statementResponse.body).toHaveProperty('description')
    expect(statementResponse.body).toHaveProperty('amount')
    expect(statementResponse.body).toHaveProperty('type')
    expect(statementResponse.body).toHaveProperty('created_at')
    expect(statementResponse.body).toHaveProperty('updated_at')
  })

  it("Should not be able to get a statement if not exists", async () => {
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

    await request(app).post('/api/v1/statements/deposit').send({
      amount: 100,
      description: 'Test deposit'
    }).set({
      Authorization: 'Bearer ' + token
    })

    const id = uuidv4()

    const statementResponse = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: 'Bearer ' + token
    })

    expect(statementResponse.body.message).toBe('Statement not found')
  })

  it("Should not be able to get a statement operation without authorization", async () => {
    const id = uuidv4()
    const statementResponse = await request(app).get(`/api/v1/statements/${id}`)

    expect(statementResponse.body.message).toBe('JWT token is missing!')
  })
})
