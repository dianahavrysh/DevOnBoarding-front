# DevOnBoarding - UI (Knockout + koGrid + RequireJS + Sammy)

Фронтенд для ASP.NET Core проєкту `DevOnBoarding` (Empty template). Це окремий проєкт (`DevOnBoarding-front.csproj`), який працює на власному порту й ходить в API по HTTP.

## Запуск
1. Бекенд: додайте CORS (див. нижче) і запустіть `dotnet run`; запам'ятайте його URL.
2. Впишіть цей URL у `wwwroot/js/app/config.js` (`API`).
3. Фронт: `dotnet run` у цій папці, відкрийте https://localhost:7002.

CORS у `Program.cs` бекенду:
```csharp
builder.Services.AddCors(o => o.AddPolicy("front", p => p
    .WithOrigins("https://localhost:7002", "http://localhost:5002")
    .AllowAnyHeader().AllowAnyMethod()));
// ...
app.UseRouting();
app.UseCors("front");        // після UseRouting, ДО UseAuthentication/UseAuthorization/UseRateLimiter
```

## Структура

```
Controllers/
  UsersPageController.cs     /Users, /Users/Details  (лише віддають .cshtml)
  AccountController.cs       /Account/Login
Views/
  _ViewImports.cshtml, _ViewStart.cshtml
  Shared/_Layout.cshtml      шапка, підключення require.config.js + require.js
  Users/UserList.cshtml      список (пошук, фільтри, koGrid)
  Users/UserDetails.cshtml   add / view / edit
  Account/Login.cshtml
wwwroot/
  css/site.css               кастомні стилі
  lib/                       jquery 3.7.1, knockout 3.5.1, requirejs 2.3.6, sammy 0.7.6, koGrid 2.1.1 (+css)
  js/require.config.js       paths + shim для бібліотек
  js/app/
    config.js                URL API, ролі, поля пошуку, розміри сторінок
    globals.js               window.ko / window.jQuery для koGrid
    auth.js                  JWT: збереження, claims, isAdmin
    api.js                   $.ajax + Bearer + нормалізація помилок і ResultDTO
    format.js                дати, екранування HTML, назви ролей
    layout.js                guard (редірект на логін) + шапка
    login.js                 сторінка входу
    list.js                  ЗАГАЛЬНА логіка списку (paging/sort/search) - bonus
    user_list.js             ініціалізує list.js: колонки, мапінг, дії
    details.js               ЗАГАЛЬНА логіка add/view/edit - bonus
    user_details.js          модель користувача, валідація, Sammy-роути
```

## Контракт з бекендом (збігається з UsersController / AuthController)

| Дія | Запит | Відповідь |
|---|---|---|
| Вхід | `POST /api/auth/login` `{email, password}` | `{token}`; 401 ProblemDetails; 429 від rate limiter |
| Список | `GET /api/users?currentPage&pageSize&sortExpression&searchValue&searchByUserName&searchByEmail&searchByFirstName&searchBySecondName&includeInactive&strictMatch` | `{items:[UserDTO], totalRows}` |
| Один | `GET /api/users/{guid}` | `UserDTO` |
| Створити | `POST /api/users` (без userPK) | 201 + `UserDTO` |
| Змінити | `PUT /api/users` (userPK у тілі) | 204 |
| Видалити | `DELETE /api/users/{guid}` | 204 |

JSON у camelCase: `userPK` (Guid), `userName`, `email`, `password`, `activeStatus`, `roleTypePK`, `firstName`, `secondName`, `birthDate`.
`sortExpression` має вигляд `UserName asc` (відповідність колонок - `sortFields` у `user_list.js`).
У режимі edit порожній пароль не надсилається. Ролі (`config.js`) приведіть до значень RoleTypes.

## Режими й роутинг (Sammy)

`/Users/Details#/add` · `/Users/Details#/view/5` · `/Users/Details#/edit/5`

## Перевірка

1. `dotnet run`, відкрити `/Users` - буде редірект на `/Account/Login`.
2. Після входу: список, сортування кліком по заголовку, зміна розміру сторінки, пошук, Add/View/Edit/Delete.
