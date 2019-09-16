/**
 * Deribit API
 * #Overview  Deribit provides three different interfaces to access the API:  * [JSON-RPC over Websocket](#json-rpc) * [JSON-RPC over HTTP](#json-rpc) * [FIX](#fix-api) (Financial Information eXchange)  With the API Console you can use and test the JSON-RPC API, both via HTTP and  via Websocket. To visit the API console, go to __Account > API tab >  API Console tab.__   ##Naming Deribit tradeable assets or instruments use the following system of naming:  |Kind|Examples|Template|Comments| |----|--------|--------|--------| |Future|<code>BTC-25MAR16</code>, <code>BTC-5AUG16</code>|<code>BTC-DMMMYY</code>|<code>BTC</code> is currency, <code>DMMMYY</code> is expiration date, <code>D</code> stands for day of month (1 or 2 digits), <code>MMM</code> - month (3 first letters in English), <code>YY</code> stands for year.| |Perpetual|<code>BTC-PERPETUAL</code>                        ||Perpetual contract for currency <code>BTC</code>.| |Option|<code>BTC-25MAR16-420-C</code>, <code>BTC-5AUG16-580-P</code>|<code>BTC-DMMMYY-STRIKE-K</code>|<code>STRIKE</code> is option strike price in USD. Template <code>K</code> is option kind: <code>C</code> for call options or <code>P</code> for put options.|   # JSON-RPC JSON-RPC is a light-weight remote procedure call (RPC) protocol. The  [JSON-RPC specification](https://www.jsonrpc.org/specification) defines the data structures that are used for the messages that are exchanged between client and server, as well as the rules around their processing. JSON-RPC uses JSON (RFC 4627) as data format.  JSON-RPC is transport agnostic: it does not specify which transport mechanism must be used. The Deribit API supports both Websocket (preferred) and HTTP (with limitations: subscriptions are not supported over HTTP).  ## Request messages > An example of a request message:  ```json {     \"jsonrpc\": \"2.0\",     \"id\": 8066,     \"method\": \"public/ticker\",     \"params\": {         \"instrument\": \"BTC-24AUG18-6500-P\"     } } ```  According to the JSON-RPC sepcification the requests must be JSON objects with the following fields.  |Name|Type|Description| |----|----|-----------| |jsonrpc|string|The version of the JSON-RPC spec: \"2.0\"| |id|integer or string|An identifier of the request. If it is included, then the response will contain the same identifier| |method|string|The method to be invoked| |params|object|The parameters values for the method. The field names must match with the expected parameter names. The parameters that are expected are described in the documentation for the methods, below.|  <aside class=\"warning\"> The JSON-RPC specification describes two features that are currently not supported by the API:  <ul> <li>Specification of parameter values by position</li> <li>Batch requests</li> </ul>  </aside>   ## Response messages > An example of a response message:  ```json {     \"jsonrpc\": \"2.0\",     \"id\": 5239,     \"testnet\": false,     \"result\": [         {             \"currency\": \"BTC\",             \"currencyLong\": \"Bitcoin\",             \"minConfirmation\": 2,             \"txFee\": 0.0006,             \"isActive\": true,             \"coinType\": \"BITCOIN\",             \"baseAddress\": null         }     ],     \"usIn\": 1535043730126248,     \"usOut\": 1535043730126250,     \"usDiff\": 2 } ```  The JSON-RPC API always responds with a JSON object with the following fields.   |Name|Type|Description| |----|----|-----------| |id|integer|This is the same id that was sent in the request.| |result|any|If successful, the result of the API call. The format for the result is described with each method.| |error|error object|Only present if there was an error invoking the method. The error object is described below.| |testnet|boolean|Indicates whether the API in use is actually the test API.  <code>false</code> for production server, <code>true</code> for test server.| |usIn|integer|The timestamp when the requests was received (microseconds since the Unix epoch)| |usOut|integer|The timestamp when the response was sent (microseconds since the Unix epoch)| |usDiff|integer|The number of microseconds that was spent handling the request|  <aside class=\"notice\"> The fields <code>testnet</code>, <code>usIn</code>, <code>usOut</code> and <code>usDiff</code> are not part of the JSON-RPC standard.  <p>In order not to clutter the examples they will generally be omitted from the example code.</p> </aside>  > An example of a response with an error:  ```json {     \"jsonrpc\": \"2.0\",     \"id\": 8163,     \"error\": {         \"code\": 11050,         \"message\": \"bad_request\"     },     \"testnet\": false,     \"usIn\": 1535037392434763,     \"usOut\": 1535037392448119,     \"usDiff\": 13356 } ``` In case of an error the response message will contain the error field, with as value an object with the following with the following fields:  |Name|Type|Description |----|----|-----------| |code|integer|A number that indicates the kind of error.| |message|string|A short description that indicates the kind of error.| |data|any|Additional data about the error. This field may be omitted.|  ## Notifications  > An example of a notification:  ```json {     \"jsonrpc\": \"2.0\",     \"method\": \"subscription\",     \"params\": {         \"channel\": \"deribit_price_index.btc_usd\",         \"data\": {             \"timestamp\": 1535098298227,             \"price\": 6521.17,             \"index_name\": \"btc_usd\"         }     } } ```  API users can subscribe to certain types of notifications. This means that they will receive JSON-RPC notification-messages from the server when certain events occur, such as changes to the index price or changes to the order book for a certain instrument.   The API methods [public/subscribe](#public-subscribe) and [private/subscribe](#private-subscribe) are used to set up a subscription. Since HTTP does not support the sending of messages from server to client, these methods are only availble when using the Websocket transport mechanism.  At the moment of subscription a \"channel\" must be specified. The channel determines the type of events that will be received.  See [Subscriptions](#subscriptions) for more details about the channels.  In accordance with the JSON-RPC specification, the format of a notification  is that of a request message without an <code>id</code> field. The value of the <code>method</code> field will always be <code>\"subscription\"</code>. The <code>params</code> field will always be an object with 2 members: <code>channel</code> and <code>data</code>. The value of the <code>channel</code> member is the name of the channel (a string). The value of the <code>data</code> member is an object that contains data  that is specific for the channel.   ## Authentication  > An example of a JSON request with token:  ```json {     \"id\": 5647,     \"method\": \"private/get_subaccounts\",     \"params\": {         \"access_token\": \"67SVutDoVZSzkUStHSuk51WntMNBJ5mh5DYZhwzpiqDF\"     } } ```  The API consists of `public` and `private` methods. The public methods do not require authentication. The private methods use OAuth 2.0 authentication. This means that a valid OAuth access token must be included in the request, which can get achived by calling method [public/auth](#public-auth).  When the token was assigned to the user, it should be passed along, with other request parameters, back to the server:  |Connection type|Access token placement |----|-----------| |**Websocket**|Inside request JSON parameters, as an `access_token` field| |**HTTP (REST)**|Header `Authorization: bearer ```Token``` ` value|  ### Additional authorization method - basic user credentials  <span style=\"color:red\"><b> ! Not recommended - however, it could be useful for quick testing API</b></span></br>  Every `private` method could be accessed by providing, inside HTTP `Authorization: Basic XXX` header, values with user `ClientId` and assigned `ClientSecret` (both values can be found on the API page on the Deribit website) encoded with `Base64`:  <code>Authorization: Basic BASE64(`ClientId` + `:` + `ClientSecret`)</code>   ### Additional authorization method - Deribit signature credentials  The Derbit service provides dedicated authorization method, which harness user generated signature to increase security level for passing request data. Generated value is passed inside `Authorization` header, coded as:  <code>Authorization: deri-hmac-sha256 id=```ClientId```,ts=```Timestamp```,sig=```Signature```,nonce=```Nonce```</code>  where:  |Deribit credential|Description |----|-----------| |*ClientId*|Can be found on the API page on the Deribit website| |*Timestamp*|Time when the request was generated - given as **miliseconds**. It's valid for **60 seconds** since generation, after that time any request with an old timestamp will be rejected.| |*Signature*|Value for signature calculated as described below | |*Nonce*|Single usage, user generated initialization vector for the server token|  The signature is generated by the following formula:  <code> Signature = HEX_STRING( HMAC-SHA256( ClientSecret, StringToSign ) );</code></br>  <code> StringToSign =  Timestamp + \"\\n\" + Nonce + \"\\n\" + RequestData;</code></br>  <code> RequestData =  UPPERCASE(HTTP_METHOD())  + \"\\n\" + URI() + \"\\n\" + RequestBody + \"\\n\";</code></br>   e.g. (using shell with ```openssl``` tool):  <code>&nbsp;&nbsp;&nbsp;&nbsp;ClientId=AAAAAAAAAAA</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;ClientSecret=ABCD</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Timestamp=$( date +%s000 )</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Nonce=$( cat /dev/urandom | tr -dc 'a-z0-9' | head -c8 )</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;URI=\"/api/v2/private/get_account_summary?currency=BTC\"</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;HttpMethod=GET</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Body=\"\"</code></br></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Signature=$( echo -ne \"${Timestamp}\\n${Nonce}\\n${HttpMethod}\\n${URI}\\n${Body}\\n\" | openssl sha256 -r -hmac \"$ClientSecret\" | cut -f1 -d' ' )</code></br></br> <code>&nbsp;&nbsp;&nbsp;&nbsp;echo $Signature</code></br></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;shell output> ea40d5e5e4fae235ab22b61da98121fbf4acdc06db03d632e23c66bcccb90d2c  (**WARNING**: Exact value depends on current timestamp and client credentials</code></br></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;curl -s -X ${HttpMethod} -H \"Authorization: deri-hmac-sha256 id=${ClientId},ts=${Timestamp},nonce=${Nonce},sig=${Signature}\" \"https://www.deribit.com${URI}\"</code></br></br>    ### Additional authorization method - signature credentials (WebSocket API)  When connecting through Websocket, user can request for authorization using ```client_credential``` method, which requires providing following parameters (as a part of JSON request):  |JSON parameter|Description |----|-----------| |*grant_type*|Must be **client_signature**| |*client_id*|Can be found on the API page on the Deribit website| |*timestamp*|Time when the request was generated - given as **miliseconds**. It's valid for **60 seconds** since generation, after that time any request with an old timestamp will be rejected.| |*signature*|Value for signature calculated as described below | |*nonce*|Single usage, user generated initialization vector for the server token| |*data*|**Optional** field, which contains any user specific value|  The signature is generated by the following formula:  <code> StringToSign =  Timestamp + \"\\n\" + Nonce + \"\\n\" + Data;</code></br>  <code> Signature = HEX_STRING( HMAC-SHA256( ClientSecret, StringToSign ) );</code></br>   e.g. (using shell with ```openssl``` tool):  <code>&nbsp;&nbsp;&nbsp;&nbsp;ClientId=AAAAAAAAAAA</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;ClientSecret=ABCD</code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Timestamp=$( date +%s000 ) # e.g. 1554883365000 </code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Nonce=$( cat /dev/urandom | tr -dc 'a-z0-9' | head -c8 ) # e.g. fdbmmz79 </code></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Data=\"\"</code></br></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;Signature=$( echo -ne \"${Timestamp}\\n${Nonce}\\n${Data}\\n\" | openssl sha256 -r -hmac \"$ClientSecret\" | cut -f1 -d' ' )</code></br></br> <code>&nbsp;&nbsp;&nbsp;&nbsp;echo $Signature</code></br></br>  <code>&nbsp;&nbsp;&nbsp;&nbsp;shell output> e20c9cd5639d41f8bbc88f4d699c4baf94a4f0ee320e9a116b72743c449eb994  (**WARNING**: Exact value depends on current timestamp and client credentials</code></br></br>   You can also check the signature value using some online tools like, e.g: [https://codebeautify.org/hmac-generator](https://codebeautify.org/hmac-generator) (but don't forget about adding *newline* after each part of the hashed text and remember that you **should use** it only with your **test credentials**).   Here's a sample JSON request created using the values from the example above:  <code> {                            </br> &nbsp;&nbsp;\"jsonrpc\" : \"2.0\",         </br> &nbsp;&nbsp;\"id\" : 9929,               </br> &nbsp;&nbsp;\"method\" : \"public/auth\",  </br> &nbsp;&nbsp;\"params\" :                 </br> &nbsp;&nbsp;{                        </br> &nbsp;&nbsp;&nbsp;&nbsp;\"grant_type\" : \"client_signature\",   </br> &nbsp;&nbsp;&nbsp;&nbsp;\"client_id\" : \"AAAAAAAAAAA\",         </br> &nbsp;&nbsp;&nbsp;&nbsp;\"timestamp\": \"1554883365000\",        </br> &nbsp;&nbsp;&nbsp;&nbsp;\"nonce\": \"fdbmmz79\",                 </br> &nbsp;&nbsp;&nbsp;&nbsp;\"data\": \"\",                          </br> &nbsp;&nbsp;&nbsp;&nbsp;\"signature\" : \"e20c9cd5639d41f8bbc88f4d699c4baf94a4f0ee320e9a116b72743c449eb994\"  </br> &nbsp;&nbsp;}                        </br> }                            </br> </code>   ### Access scope  When asking for `access token` user can provide the required access level (called `scope`) which defines what type of functionality he/she wants to use, and whether requests are only going to check for some data or also to update them.  Scopes are required and checked for `private` methods, so if you plan to use only `public` information you can stay with values assigned by default.  |Scope|Description |----|-----------| |*account:read*|Access to **account** methods - read only data| |*account:read_write*|Access to **account** methods - allows to manage account settings, add subaccounts, etc.| |*trade:read*|Access to **trade** methods - read only data| |*trade:read_write*|Access to **trade** methods - required to create and modify orders| |*wallet:read*|Access to **wallet** methods - read only data| |*wallet:read_write*|Access to **wallet** methods - allows to withdraw, generate new deposit address, etc.| |*wallet:none*, *account:none*, *trade:none*|Blocked access to specified functionality|    <span style=\"color:red\">**NOTICE:**</span> Depending on choosing an authentication method (```grant type```) some scopes could be narrowed by the server. e.g. when ```grant_type = client_credentials``` and ```scope = wallet:read_write``` it's modified by the server as ```scope = wallet:read```\"   ## JSON-RPC over websocket Websocket is the prefered transport mechanism for the JSON-RPC API, because it is faster and because it can support [subscriptions](#subscriptions) and [cancel on disconnect](#private-enable_cancel_on_disconnect). The code examples that can be found next to each of the methods show how websockets can be used from Python or Javascript/node.js.  ## JSON-RPC over HTTP Besides websockets it is also possible to use the API via HTTP. The code examples for 'shell' show how this can be done using curl. Note that subscriptions and cancel on disconnect are not supported via HTTP.  #Methods 
 *
 * The version of the OpenAPI document: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 *
 */

var ApiClient =require( '../ApiClient');

/**
 * The Position model module.
 * @module model/Position
 * @version 2.0.0
 */
class Position {
    /**
     * Constructs a new <code>Position</code>.
     * @alias module:model/Position
     * @param direction {module:model/Position.DirectionEnum} direction, `buy` or `sell`
     * @param floatingProfitLoss {Number} Floating profit or loss
     * @param openOrdersMargin {Number} Open orders margin
     * @param totalProfitLoss {Number} Profit or loss from position
     * @param delta {Number} Delta parameter
     * @param initialMargin {Number} Initial margin
     * @param size {Number} Position size for futures size in quote currency (e.g. USD), for options size is in base currency (e.g. BTC)
     * @param maintenanceMargin {Number} Maintenance margin
     * @param kind {module:model/Position.KindEnum} Instrument kind, `\"future\"` or `\"option\"`
     * @param markPrice {Number} Current mark price for position's instrument
     * @param averagePrice {Number} Average price of trades that built this position
     * @param settlementPrice {Number} Last settlement price for position's instrument 0 if instrument wasn't settled yet
     * @param indexPrice {Number} Current index price
     * @param instrumentName {String} Unique instrument identifier
     */
    constructor(direction, floatingProfitLoss, openOrdersMargin, totalProfitLoss, delta, initialMargin, size, maintenanceMargin, kind, markPrice, averagePrice, settlementPrice, indexPrice, instrumentName) { 
        
        Position.initialize(this, direction, floatingProfitLoss, openOrdersMargin, totalProfitLoss, delta, initialMargin, size, maintenanceMargin, kind, markPrice, averagePrice, settlementPrice, indexPrice, instrumentName);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, direction, floatingProfitLoss, openOrdersMargin, totalProfitLoss, delta, initialMargin, size, maintenanceMargin, kind, markPrice, averagePrice, settlementPrice, indexPrice, instrumentName) { 
        obj['direction'] = direction;
        obj['floating_profit_loss'] = floatingProfitLoss;
        obj['open_orders_margin'] = openOrdersMargin;
        obj['total_profit_loss'] = totalProfitLoss;
        obj['delta'] = delta;
        obj['initial_margin'] = initialMargin;
        obj['size'] = size;
        obj['maintenance_margin'] = maintenanceMargin;
        obj['kind'] = kind;
        obj['mark_price'] = markPrice;
        obj['average_price'] = averagePrice;
        obj['settlement_price'] = settlementPrice;
        obj['index_price'] = indexPrice;
        obj['instrument_name'] = instrumentName;
    }

    /**
     * Constructs a <code>Position</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/Position} obj Optional instance to populate.
     * @return {module:model/Position} The populated <code>Position</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new Position();

            if (data.hasOwnProperty('direction')) {
                obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
            }
            if (data.hasOwnProperty('average_price_usd')) {
                obj['average_price_usd'] = ApiClient.convertToType(data['average_price_usd'], 'Number');
            }
            if (data.hasOwnProperty('estimated_liquidation_price')) {
                obj['estimated_liquidation_price'] = ApiClient.convertToType(data['estimated_liquidation_price'], 'Number');
            }
            if (data.hasOwnProperty('floating_profit_loss')) {
                obj['floating_profit_loss'] = ApiClient.convertToType(data['floating_profit_loss'], 'Number');
            }
            if (data.hasOwnProperty('floating_profit_loss_usd')) {
                obj['floating_profit_loss_usd'] = ApiClient.convertToType(data['floating_profit_loss_usd'], 'Number');
            }
            if (data.hasOwnProperty('open_orders_margin')) {
                obj['open_orders_margin'] = ApiClient.convertToType(data['open_orders_margin'], 'Number');
            }
            if (data.hasOwnProperty('total_profit_loss')) {
                obj['total_profit_loss'] = ApiClient.convertToType(data['total_profit_loss'], 'Number');
            }
            if (data.hasOwnProperty('realized_profit_loss')) {
                obj['realized_profit_loss'] = ApiClient.convertToType(data['realized_profit_loss'], 'Number');
            }
            if (data.hasOwnProperty('delta')) {
                obj['delta'] = ApiClient.convertToType(data['delta'], 'Number');
            }
            if (data.hasOwnProperty('initial_margin')) {
                obj['initial_margin'] = ApiClient.convertToType(data['initial_margin'], 'Number');
            }
            if (data.hasOwnProperty('size')) {
                obj['size'] = ApiClient.convertToType(data['size'], 'Number');
            }
            if (data.hasOwnProperty('maintenance_margin')) {
                obj['maintenance_margin'] = ApiClient.convertToType(data['maintenance_margin'], 'Number');
            }
            if (data.hasOwnProperty('kind')) {
                obj['kind'] = ApiClient.convertToType(data['kind'], 'String');
            }
            if (data.hasOwnProperty('mark_price')) {
                obj['mark_price'] = ApiClient.convertToType(data['mark_price'], 'Number');
            }
            if (data.hasOwnProperty('average_price')) {
                obj['average_price'] = ApiClient.convertToType(data['average_price'], 'Number');
            }
            if (data.hasOwnProperty('settlement_price')) {
                obj['settlement_price'] = ApiClient.convertToType(data['settlement_price'], 'Number');
            }
            if (data.hasOwnProperty('index_price')) {
                obj['index_price'] = ApiClient.convertToType(data['index_price'], 'Number');
            }
            if (data.hasOwnProperty('instrument_name')) {
                obj['instrument_name'] = ApiClient.convertToType(data['instrument_name'], 'String');
            }
            if (data.hasOwnProperty('size_currency')) {
                obj['size_currency'] = ApiClient.convertToType(data['size_currency'], 'Number');
            }
        }
        return obj;
    }


}

/**
 * direction, `buy` or `sell`
 * @member {module:model/Position.DirectionEnum} direction
 */
Position.prototype['direction'] = undefined;

/**
 * Only for options, average price in USD
 * @member {Number} average_price_usd
 */
Position.prototype['average_price_usd'] = undefined;

/**
 * Only for futures, estimated liquidation price
 * @member {Number} estimated_liquidation_price
 */
Position.prototype['estimated_liquidation_price'] = undefined;

/**
 * Floating profit or loss
 * @member {Number} floating_profit_loss
 */
Position.prototype['floating_profit_loss'] = undefined;

/**
 * Only for options, floating profit or loss in USD
 * @member {Number} floating_profit_loss_usd
 */
Position.prototype['floating_profit_loss_usd'] = undefined;

/**
 * Open orders margin
 * @member {Number} open_orders_margin
 */
Position.prototype['open_orders_margin'] = undefined;

/**
 * Profit or loss from position
 * @member {Number} total_profit_loss
 */
Position.prototype['total_profit_loss'] = undefined;

/**
 * Realized profit or loss
 * @member {Number} realized_profit_loss
 */
Position.prototype['realized_profit_loss'] = undefined;

/**
 * Delta parameter
 * @member {Number} delta
 */
Position.prototype['delta'] = undefined;

/**
 * Initial margin
 * @member {Number} initial_margin
 */
Position.prototype['initial_margin'] = undefined;

/**
 * Position size for futures size in quote currency (e.g. USD), for options size is in base currency (e.g. BTC)
 * @member {Number} size
 */
Position.prototype['size'] = undefined;

/**
 * Maintenance margin
 * @member {Number} maintenance_margin
 */
Position.prototype['maintenance_margin'] = undefined;

/**
 * Instrument kind, `\"future\"` or `\"option\"`
 * @member {module:model/Position.KindEnum} kind
 */
Position.prototype['kind'] = undefined;

/**
 * Current mark price for position's instrument
 * @member {Number} mark_price
 */
Position.prototype['mark_price'] = undefined;

/**
 * Average price of trades that built this position
 * @member {Number} average_price
 */
Position.prototype['average_price'] = undefined;

/**
 * Last settlement price for position's instrument 0 if instrument wasn't settled yet
 * @member {Number} settlement_price
 */
Position.prototype['settlement_price'] = undefined;

/**
 * Current index price
 * @member {Number} index_price
 */
Position.prototype['index_price'] = undefined;

/**
 * Unique instrument identifier
 * @member {String} instrument_name
 */
Position.prototype['instrument_name'] = undefined;

/**
 * Only for futures, position size in base currency
 * @member {Number} size_currency
 */
Position.prototype['size_currency'] = undefined;





/**
 * Allowed values for the <code>direction</code> property.
 * @enum {String}
 * @readonly
 */
Position['DirectionEnum'] = {

    /**
     * value: "buy"
     * @const
     */
    "buy": "buy",

    /**
     * value: "sell"
     * @const
     */
    "sell": "sell"
};


/**
 * Allowed values for the <code>kind</code> property.
 * @enum {String}
 * @readonly
 */
Position['KindEnum'] = {

    /**
     * value: "future"
     * @const
     */
    "future": "future",

    /**
     * value: "option"
     * @const
     */
    "option": "option"
};



export default Position;

