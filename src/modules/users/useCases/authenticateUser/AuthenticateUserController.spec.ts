import { hash } from 'bcryptjs'
import request from 'supertest'
import { Connection } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'


import { app } from '../../../../app'
import createConnection from '../../../../database'

let connection: Connection

describe('Authenticate User Controller', () => {

  beforeAll(async () => {

    connection = await createConnection();

    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash('admin', 8)

    await connection.query(
      `INSERT INTO users (id, name, email, password, created_at) VALUES ('${id}', 'admin', 'admin@admin.com', '${password}', 'now()')`
    )
  });


  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to authenticate a user", async () => {

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'admin@admin.com',
      password: 'admin'
    })


    expect(responseToken.body).toHaveProperty('token')
    expect(responseToken.status).toBe(200)
  })

  it("Should not be able to authenticate a non-exists user", async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'email@email.com',
      password: 'admin'
    })


    expect(response.body.message).toEqual('Incorrect email or password')
    expect(response.status).toBe(401)
  })
})
