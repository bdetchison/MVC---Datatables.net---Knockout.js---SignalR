using System.Collections.Generic;
using System.Web.Mvc;
using MVC3_SignalR_Knockout.Models;
using MVC3_SignalR_Knockout.Utility;
using SignalR.Hubs;

namespace MVC3_SignalR_Knockout.Controllers
{
    public class GiftsCOGController : Controller
    {
        //
        // GET: /GiftsCOG/

        public ActionResult Index()
        {
            var initialState = new[] {
                new GiftModel { Title = "Tall Hat", Price = 49.95 },
                new GiftModel { Title = "Long Cloak", Price = 78.25 }
            };
            return View(initialState);
        }

        [HttpPost]
        public ActionResult Index([FromJson] IEnumerable<GiftModel> gifts)
        {
            // Can process the data any way we want here,
            // e.g., further server-side validation, save to database, etc
            return View("Saved", gifts);
        }


        [HttpPost]
        public ActionResult GiftsCOG([FromJson] List<GiftModel> gifts, [FromJson] string guid)
        {
            //mimic save action
            GiftHub.Gifts = gifts.ToArray();

            //Initiate client notification
            dynamic clients = Hub.GetClients<GiftHub>();
            clients.setGifts(GiftHub.Gifts, guid);

            //load view
            return View(gifts.ToArray());
        }

        public ActionResult GiftsCOG()
        {

            GiftModel[] gifts = GiftHub.Gifts;

            return View(gifts);
        }


        //
        // GET: /GiftsCOG/Details/5

        public ActionResult Details(int id)
        {
            return View();
        }

        //
        // GET: /GiftsCOG/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /GiftsCOG/Create

        [HttpPost]
        public ActionResult Create(FormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /GiftsCOG/Edit/5

        public ActionResult Edit(int id)
        {
            return View();
        }

        //
        // POST: /GiftsCOG/Edit/5

        [HttpPost]
        public ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /GiftsCOG/Delete/5

        public ActionResult Delete(int id)
        {
            return View();
        }

        //
        // POST: /GiftsCOG/Delete/5

        [HttpPost]
        public ActionResult Delete(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }
    }
}
