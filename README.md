# 🔗 LinkVault — Backend API

LinkVault is a secure RESTful API built with ASP.NET Core (.NET 10) for managing categorized link collections per user.

The system supports:
- JWT Authentication
- Collections CRUD (Paginated)
- Links CRUD (Paginated + Search + Filter)
- Categories CRUD
- Move Link between Collections

---

# 🏗 Tech Stack

- ASP.NET Core Web API (.NET 10)
- React
- Postgres
- JWT Authentication
- Swagger (Swashbuckle)
- Postman


---

# 🚀 Setup Instructions

1. Clone repository
2. Configure `appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=LinksDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

```json
"Jwt": {
  "Key": "YOUR_SECURE_RANDOM_KEY_32+_CHARS",
  "Issuer": "LinkVault",
  "Audience": "LinkVaultClient",
  "ExpiresMinutes": 120
}
```

3. Run:

```
dotnet run
```

Swagger:
```
https://localhost:7168/swagger
```

---

# 🔐 AUTH ENDPOINTS

## Register

POST /api/auth/register

```json
{
  "name": "Anas",
  "email": "anas@test.com",
  "password": "Test@12345"
}
```

---

## Login

POST /api/auth/login

```json
{
  "email": "anas@test.com",
  "password": "Test@12345"
}
```

Returns JWT token.

---

## Get Current User (Token Test)

GET /api/auth/me

Requires:
```
Authorization: Bearer <token>
```

---

# 📁 COLLECTIONS ENDPOINTS

## Create Collection

POST /api/collections

```json
{
  "name": "Programming"
}
```

---

## Get Collections (Paginated)

GET /api/collections?page=1&pageSize=10&q=prog&sort=name

Query Parameters:
- page
- pageSize (max 100)
- q (search by name)
- sort (newest | oldest | name)

---

## Get Collection by Id

GET /api/collections/{id}

---

## Update Collection

PUT /api/collections/{id}

```json
{
  "name": "Work"
}
```

---

## Delete Collection

DELETE /api/collections/{id}

Deleting a collection automatically deletes its links (Cascade).

---

# 🔗 LINKS ENDPOINTS

## Create Link (Inside Collection)

POST /api/collections/{collectionId}/links

```json
{
  "url": "https://learn.microsoft.com",
  "title": "MS Docs",
  "description": "Official documentation",
  "categoryId": 1
}
```

---

## Get Links Inside Collection (Paginated + Filter)

GET /api/collections/{collectionId}/links?page=1&pageSize=10&q=docs&categoryId=2&sort=newest

Query Parameters:
- page
- pageSize
- q (search in url, title, description)
- categoryId
- sort (newest | oldest)

Response format:

```json
{
  "page": 1,
  "pageSize": 10,
  "totalCount": 25,
  "totalPages": 3,
  "items": [ ... ]
}
```

---

## Get Link by Id

GET /api/links/{id}

---

## Update Link

PUT /api/links/{id}

```json
{
  "url": "https://learn.microsoft.com/aspnet",
  "title": "ASP.NET Docs",
  "description": "Updated",
  "categoryId": 2
}
```

---

## Delete Link

DELETE /api/links/{id}

---

## Move Link to Another Collection

PATCH /api/links/{id}/move

```json
{
  "targetCollectionId": 2
}
```

---

# 🗂 CATEGORIES ENDPOINTS

## Create Category

POST /api/categories

```json
{
  "name": "Work"
}
```

---

## Get Categories

GET /api/categories

---

## Get Category by Id

GET /api/categories/{id}

---

## Update Category

PUT /api/categories/{id}

```json
{
  "name": "Work Updated"
}
```

---

## Delete Category

DELETE /api/categories/{id}

Note:
Links using this category will be automatically unlinked before deletion.

---

# 🔒 Security Notes

- UserId extracted from JWT
- No userId accepted from client
- Passwords hashed using ASP.NET PasswordHasher
- Max pageSize limited to 100
- All data scoped per authenticated user

---

# 👨‍💻 Author

Anas Amoorah  
ASP.NET Core Backend Developer  






