import { Connection } from "typeorm";
import request from 'supertest'

import createConnection from '../../../../database'
import { app } from "../../../../app";


let connection: Connection

describe('Show User Profile Controller', () => {

  beforeAll(async () => {

    connection = await createConnection()

    await connection.runMigrations()
  })

  afterAll(async () => {
    connection.dropDatabase()
    connection.close()
  })

  it("should be able to see a user profile", async () => {

    await request(app).post('/api/v1/users').send({
      name: 'Test',
      email: 'test@test.com',
      password: 'password'
    })

    const tokenResponse = await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: 'password'
    })

    const { token } = tokenResponse.body

    const profileResponse = await request(app).get('/api/v1/profile').set({
      Authorization: 'Bearer ' + token
    })

    expect(profileResponse.status).toBe(200)
    expect(profileResponse.body).toHaveProperty('name')
    expect(profileResponse.body).toHaveProperty('id')
    expect(profileResponse.body).toHaveProperty('email')
  })


  it("Should not be able to see a user profile without login", async () => {

    await request(app).post('/api/v1/users').send({
      name: 'Test',
      email: 'test@test.com',
      password: 'password'
    })

    const profileResponse = await request(app).get('/api/v1/profile')


    expect(profileResponse.status).toBe(401)
    expect(profileResponse.body.message).toBe('JWT token is missing!')
  })
})
