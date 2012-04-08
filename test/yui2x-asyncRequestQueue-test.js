var simpleAsynRequestQueue = new YAHOO.yui2x.util.Connect.asyncRequestQueue(false);
var purgeAfterFailAsynRequestQueue = new YAHOO.yui2x.util.Connect.asyncRequestQueue(true);

function testAsyncRequestQueue(mustFail,usePurgeAfterFailQueue, reqNum)
{
  var queue = usePurgeAfterFailQueue?purgeAfterFailAsynRequestQueue:simpleAsynRequestQueue;
  for(var i=1;i<=reqNum;i++)
    {
    if(
      queue.sendAsyncRequest("POST",
              mustFail?"invalid.json":"test.json",
                {
                  success: function(){alert("request "+this+" succeded");return true;} ,
                  failure: function(){alert("request "+this+" failed")} ,
                  scope:i    
                },
              ""))
      alert("request "+i+" added to queue. queue size now: "+queue.getQueueSize());
    else
      alert("request "+i+" not sent: query was purged earlier");   
    }
}