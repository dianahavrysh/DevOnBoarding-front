using Microsoft.AspNetCore.Mvc;

namespace DevOnBoarding.Controllers
{
    [Route("Account")]
    public class AccountController : Controller
    {
        [HttpGet("Login")]
        public IActionResult Login() => View();
    }
}
