using Microsoft.AspNetCore.Mvc;

namespace DevOnBoarding.Controllers
{
    /// <summary>
    /// Віддає лише HTML-оболонки сторінок. Дані та авторизація - через API (JWT у заголовку Authorization),
    /// тому [Authorize] тут НЕ ставимо: браузер не надсилає Bearer-токен при навігації.
    /// </summary>
    [Route("Users")]
    public class UsersPageController : Controller
    {
        [HttpGet("")]
        public IActionResult Index() => View("UserList");

        [HttpGet("Details")]
        public IActionResult Details() => View("UserDetails");
    }
}
