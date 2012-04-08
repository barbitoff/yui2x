YAHOO.namespace("yui2x.util.Connect");
/**
 * Asynchronous YAHOO.util.Connect.asyncRequest request queue.
 * @param purgeQueueOnFailure when true, queue will be purged after the first request 
 * failure. After being purged, queue won`t send requests any more, returning false
 * on every sendAsyncRequest() call. 
 * Following situations are assumed as failures:
 *  - call of "failure" handler of YAHOO.util.Connect.asyncRequest (user "failure" handler
 *  can even not be set, this object sets its own handler on every 
 *  YAHOO.util.Connect.asyncRequest)
 *  - when user "success" handler returns false. User "success" handler, if is set,
 *  should return non-false value to indicate that request completed correctly and
 *  query shouldn`t be purged.
 */
YAHOO.yui2x.util.Connect.asyncRequestQueue =  function(purgeQueueOnFailure)
{
  /**
   * Queue itself.
   */
  this._requestQueue = new Array();
  /**
   * Purge-on-failure flag. 
   */
  this._purgeQueueOnFailure = purgeQueueOnFailure;
  /**
   * Flag idenifying, that user "success" or "failure" handler call is in progress.
   * Is used inside sendAsyncRequest method to deside whether this method is call
   * from the user "success" or "failure" handler of other request of the same queue
   */
  this._userHandlerInProgress = false;
  /**
   * Inner "success"-handler of YAHOO.util.Connect.asyncRequest.
   * Calls user "success"-handler of the current request (if it is set). If user handler
   * returns "false" (or any other value, which can be treated as false in JavaScript)
   * and purgeQueueOnFailure flag was set while creating asyncRequestQueue object,
   * purges queue (by seting this._requestQueue to null). Otherwise (if purgeQueueOnFailure
   * was false or if user handler returned true or any other value, which can be threated as
   * true in JavaScript) - executes next YAHOO.util.Connect.asyncRequest in the queue (if
   * not empty).
   */  
  this._successHandler = function(o)
    {
    //alert("_successHandler called, calling user success-handle");
    // extract current request from the beginning of the queue
    var curRequest = this._requestQueue.shift();
    // call user "success" callback, if exists    
    var userHandlerResult = true;
    if(curRequest[2].success)
      {
      this._userHandlerInProgress = true;
      userHandlerResult = curRequest[2].success.apply(curRequest[2].scope,new Array(o));
      this._userHandlerInProgress = false;
      }
    if(!userHandlerResult && _purgeQueueOnFailure) // if user handler returned false and _purgeQueueOnFailure set -> purge queue
       {
       //alert("User success-handler returned false and _purgeQueueOnFailure set - purging query");
       this._requestQueue = null;
       }
    else if(this._requestQueue.length!=0) // if queuenot empty - execute next request
        {
        //alert("Query not empty, calling next request");
        YAHOO.util.Connect.asyncRequest(this._requestQueue[0][0],  
                                        this._requestQueue[0][1],
                                        this._REQUEST_CALLBACK,
                                        this._requestQueue[0][3]);
        }
    };
  /**
   * Inner "failure"-handler YAHOO.util.Connect.asyncRequest.
   * Calls user "failure"-handler of the current request (if it is set) and, if
   * purgeQueueOnFailure flag is set - purges queue (by seting this._requestQueue to null).
   * Otherwise - executes next YAHOO.util.Connect.asyncRequest in the queue (if
   * not empty).
   */    
  this._failureHandler = function(o)
    {
    //alert("_failureHandler called, calling user failure-handle");
    // extract current request from the beginning of the queue
    var curRequest = this._requestQueue.shift();
    // call user failure-handler (if any)
    if(curRequest[2].failure)
        {
        this._userHandlerInProgress = true;
        curRequest[2].failure.apply(curRequest[2].scope,new Array(o));
        this._userHandlerInProgress = false; 
        }
    // if _purgeQueueOnFailure set - purge queue
    if(this._purgeQueueOnFailure)
      {
      //alert("_purgeQueueOnFailure set, purging query");
      this._requestQueue = null;
      }
    else if(this._requestQueue.length!=0)// execute next request (if any)
      {
      //alert("Query not empty, calling next request");      
      YAHOO.util.Connect.asyncRequest(this._requestQueue[0][0],  
                                      this._requestQueue[0][1],
                                      this._REQUEST_CALLBACK,
                                      this._requestQueue[0][3]);
      }
    }; 
  /**
   * Callback-configuration for YAHOO.util.Connect.asyncRequest
   */
  this._REQUEST_CALLBACK = {
      success: this._successHandler ,
      failure: this._failureHandler ,
      scope:this
    };    
  /**
   * Public method, which adds new request to the queue. Method parameters are the same
   * as for YAHOO.util.Connect.asyncRequest.
   * If the queue is empty, the request will be performed immediately. 
   * @return true, if the request was actually performed or added to queue, false - if
   * queue was earlier purged because of failure of one of requests in it (if purgeQueueOnFailure
   * was set).
   */  
  this.sendAsyncRequest = function (method , uri , callback , postData)
    {
    if(this._requestQueue == null) // if queue has been purged - return false
      {
      //alert("Query was purged, returning");
      return false;
      }
    // add request to the tail of the queue
    //alert("Adding to queue");
    this._requestQueue.push(arguments);  
    /* If queue was empty before adding new request - immediately send it (only if 
     * _userHandlerInProgress is not set) */
    if(this._requestQueue.length==1) 
      {
      /* _userHandlerInProgress flag set means that current call is made from within
       * user success of failure handler of previous request, already extracted from
       * the query. In that case, new request will be sent by _successHandler or 
       * _failureHandler methods after returning from user handler 
       */
      if(!this._userHandlerInProgress)
        //alert("Queue was empty, performing request immediately")
        YAHOO.util.Connect.asyncRequest(method,uri,this._REQUEST_CALLBACK,postData);   
      }
    return true;
    }
    
  /**
   * Public method, allowing to get current queue size
   */  
  this.getQueueSize = function()
    {
    return (this._requestQueue==null)?0:this._requestQueue.length;
    } 
  /**
   * Public method, allowing to discover if the queue is empty
   */  
  this.isEmpty = function()
    {
    return this._requestQueue==null || this._requestQueue.length==0;
    }     

}
