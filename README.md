# DevOnBoarding - UI (Knockout + koGrid + RequireJS + Sammy)

Фронтенд для ASP.NET Core проєкту `DevOnBoarding` (Empty template). Скопіюйте вміст цієї папки в корінь проєкту
(файли `Controllers`, `Views`, `wwwroot` додаються до існуючих), а в `Program.cs` додайте рядки з `Program.cs.example`.

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

## Контракт з бекендом (змінюється в `config.js` / `api.js`)

| Дія | Запит | Відповідь |
|---|---|---|
| Вхід | `POST /api/auth/login` `{userName, password}` | `{token}` (JWT з role claim) |
| Список | `GET /api/users?currentPage&pageSize&sortExpression&searchValue&searchByUserName&searchByEmail&searchByFirstName&searchBySecondName&includeInactive&strictMatch` | `ResultDTO`: `{items:[UserDTO], count}` |
| Один | `GET /api/users/{id}` | `UserDTO` або `ResultDTO` з `item` |
| Створити | `POST /api/users` | створений `UserDTO` (з `userPK`) |
| Змінити | `PUT /api/users/{id}` | `UserDTO` |
| Видалити | `DELETE /api/users/{id}` | 204 |

`UserDTO` (camelCase): `userPK, userName, email, password, activeStatus, roleTypePK, firstName, secondName, birthDate`.
`sortExpression` має вигляд `UserName asc` / `BirthDate desc` (відповідність колонок - у `user_list.js`, `sortFields`).
У режимі edit порожній пароль не надсилається.
Права (Administrator бачить усіх, User - лише звичайних) забезпечує бекенд; UI лише ховає Add/Edit/Delete не-адмінам.

## Режими й роутинг (Sammy)

`/Users/Details#/add` · `/Users/Details#/view/5` · `/Users/Details#/edit/5`

## Перевірка

1. `dotnet run`, відкрити `/Users` - буде редірект на `/Account/Login`.
2. Після входу: список, сортування кліком по заголовку, зміна розміру сторінки, пошук, Add/View/Edit/Delete.
