using Microsoft.AspNetCore.Mvc;

namespace DevOnBoarding.Controllers
{
    [Route("Users")]
    public class UsersController : Controller
    {
        [HttpGet("")]
        public IActionResult UserList() => View("UserList");

        [HttpGet("Details")]
        public IActionResult Details() => View("UserDetails");
    }
}
