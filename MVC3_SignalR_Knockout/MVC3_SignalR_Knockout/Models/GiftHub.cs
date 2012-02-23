using System;
using SignalR.Hubs;

namespace MVC3_SignalR_Knockout.Models
{
    public class GiftHub : Hub
    {
        public static GiftModel[] Gifts = new GiftModel[]
            {
                new GiftModel { Id = Guid.NewGuid(), Title = "Tall Hat", Price = 49.95 },
                new GiftModel { Id = Guid.NewGuid(), Title = "Long Cloak", Price = 78.25 }
            };

        public void GiftsUpdated()
        {
            Clients.setGifts(Gifts);
        }

        public void Start()
        {
            Caller.guid = Guid.NewGuid();
        }
    }
}