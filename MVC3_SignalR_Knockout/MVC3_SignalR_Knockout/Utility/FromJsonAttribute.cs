using System.Web.Mvc;
using System.Web.Script.Serialization;

namespace MVC3_SignalR_Knockout.Utility
{
    public class FromJsonAttribute : CustomModelBinderAttribute
    {
        private readonly static JavaScriptSerializer serializer = new JavaScriptSerializer();

        public override IModelBinder GetBinder()
        {
            return new JsonModelBinder();
        }

        private class JsonModelBinder : IModelBinder
        {
            public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
            {
                var stringified = controllerContext.HttpContext.Request[bindingContext.ModelName];
                if (string.IsNullOrEmpty(stringified))
                    return null;
                return serializer.Deserialize(stringified, bindingContext.ModelType);
            }
        }
    }
}