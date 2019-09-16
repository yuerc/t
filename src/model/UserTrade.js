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

import ApiClient from '../ApiClient';

/**
 * The UserTrade model module.
 * @module model/UserTrade
 * @version 2.0.0
 */
class UserTrade {
    /**
     * Constructs a new <code>UserTrade</code>.
     * @alias module:model/UserTrade
     * @param direction {module:model/UserTrade.DirectionEnum} Trade direction of the taker
     * @param feeCurrency {module:model/UserTrade.FeeCurrencyEnum} Currency, i.e `\"BTC\"`, `\"ETH\"`
     * @param orderId {String} Id of the user order (maker or taker), i.e. subscriber's order id that took part in the trade
     * @param timestamp {Number} The timestamp of the trade
     * @param price {Number} The price of the trade
     * @param tradeId {String} Unique (per currency) trade identifier
     * @param fee {Number} User's fee in units of the specified `fee_currency`
     * @param tradeSeq {Number} The sequence number of the trade within instrument
     * @param selfTrade {Boolean} `true` if the trade is against own order. This can only happen when your account has self-trading enabled. Contact an administrator if you think you need that
     * @param state {module:model/UserTrade.StateEnum} order state, `\"open\"`, `\"filled\"`, `\"rejected\"`, `\"cancelled\"`, `\"untriggered\"` or `\"archive\"` (if order was archived)
     * @param indexPrice {Number} Index Price at the moment of trade
     * @param amount {Number} Trade amount. For perpetual and futures - in USD units, for options it is amount of corresponding cryptocurrency contracts, e.g., BTC or ETH.
     * @param instrumentName {String} Unique instrument identifier
     * @param tickDirection {module:model/UserTrade.TickDirectionEnum} Direction of the \"tick\" (`0` = Plus Tick, `1` = Zero-Plus Tick, `2` = Minus Tick, `3` = Zero-Minus Tick).
     * @param matchingId {String} Always `null`, except for a self-trade which is possible only if self-trading is switched on for the account (in that case this will be id of the maker order of the subscriber)
     */
    constructor(direction, feeCurrency, orderId, timestamp, price, tradeId, fee, tradeSeq, selfTrade, state, indexPrice, amount, instrumentName, tickDirection, matchingId) { 
        
        UserTrade.initialize(this, direction, feeCurrency, orderId, timestamp, price, tradeId, fee, tradeSeq, selfTrade, state, indexPrice, amount, instrumentName, tickDirection, matchingId);
    }

    /**
     * Initializes the fields of this object.
     * This method is used by the constructors of any subclasses, in order to implement multiple inheritance (mix-ins).
     * Only for internal use.
     */
    static initialize(obj, direction, feeCurrency, orderId, timestamp, price, tradeId, fee, tradeSeq, selfTrade, state, indexPrice, amount, instrumentName, tickDirection, matchingId) { 
        obj['direction'] = direction;
        obj['fee_currency'] = feeCurrency;
        obj['order_id'] = orderId;
        obj['timestamp'] = timestamp;
        obj['price'] = price;
        obj['trade_id'] = tradeId;
        obj['fee'] = fee;
        obj['trade_seq'] = tradeSeq;
        obj['self_trade'] = selfTrade;
        obj['state'] = state;
        obj['index_price'] = indexPrice;
        obj['amount'] = amount;
        obj['instrument_name'] = instrumentName;
        obj['tick_direction'] = tickDirection;
        obj['matching_id'] = matchingId;
    }

    /**
     * Constructs a <code>UserTrade</code> from a plain JavaScript object, optionally creating a new instance.
     * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
     * @param {Object} data The plain JavaScript object bearing properties of interest.
     * @param {module:model/UserTrade} obj Optional instance to populate.
     * @return {module:model/UserTrade} The populated <code>UserTrade</code> instance.
     */
    static constructFromObject(data, obj) {
        if (data) {
            obj = obj || new UserTrade();

            if (data.hasOwnProperty('direction')) {
                obj['direction'] = ApiClient.convertToType(data['direction'], 'String');
            }
            if (data.hasOwnProperty('fee_currency')) {
                obj['fee_currency'] = ApiClient.convertToType(data['fee_currency'], 'String');
            }
            if (data.hasOwnProperty('order_id')) {
                obj['order_id'] = ApiClient.convertToType(data['order_id'], 'String');
            }
            if (data.hasOwnProperty('timestamp')) {
                obj['timestamp'] = ApiClient.convertToType(data['timestamp'], 'Number');
            }
            if (data.hasOwnProperty('price')) {
                obj['price'] = ApiClient.convertToType(data['price'], 'Number');
            }
            if (data.hasOwnProperty('iv')) {
                obj['iv'] = ApiClient.convertToType(data['iv'], 'Number');
            }
            if (data.hasOwnProperty('trade_id')) {
                obj['trade_id'] = ApiClient.convertToType(data['trade_id'], 'String');
            }
            if (data.hasOwnProperty('fee')) {
                obj['fee'] = ApiClient.convertToType(data['fee'], 'Number');
            }
            if (data.hasOwnProperty('order_type')) {
                obj['order_type'] = ApiClient.convertToType(data['order_type'], 'String');
            }
            if (data.hasOwnProperty('trade_seq')) {
                obj['trade_seq'] = ApiClient.convertToType(data['trade_seq'], 'Number');
            }
            if (data.hasOwnProperty('self_trade')) {
                obj['self_trade'] = ApiClient.convertToType(data['self_trade'], 'Boolean');
            }
            if (data.hasOwnProperty('state')) {
                obj['state'] = ApiClient.convertToType(data['state'], 'String');
            }
            if (data.hasOwnProperty('label')) {
                obj['label'] = ApiClient.convertToType(data['label'], 'String');
            }
            if (data.hasOwnProperty('index_price')) {
                obj['index_price'] = ApiClient.convertToType(data['index_price'], 'Number');
            }
            if (data.hasOwnProperty('amount')) {
                obj['amount'] = ApiClient.convertToType(data['amount'], 'Number');
            }
            if (data.hasOwnProperty('instrument_name')) {
                obj['instrument_name'] = ApiClient.convertToType(data['instrument_name'], 'String');
            }
            if (data.hasOwnProperty('tick_direction')) {
                obj['tick_direction'] = ApiClient.convertToType(data['tick_direction'], 'Number');
            }
            if (data.hasOwnProperty('matching_id')) {
                obj['matching_id'] = ApiClient.convertToType(data['matching_id'], 'String');
            }
            if (data.hasOwnProperty('liquidity')) {
                obj['liquidity'] = ApiClient.convertToType(data['liquidity'], 'String');
            }
        }
        return obj;
    }


}

/**
 * Trade direction of the taker
 * @member {module:model/UserTrade.DirectionEnum} direction
 */
UserTrade.prototype['direction'] = undefined;

/**
 * Currency, i.e `\"BTC\"`, `\"ETH\"`
 * @member {module:model/UserTrade.FeeCurrencyEnum} fee_currency
 */
UserTrade.prototype['fee_currency'] = undefined;

/**
 * Id of the user order (maker or taker), i.e. subscriber's order id that took part in the trade
 * @member {String} order_id
 */
UserTrade.prototype['order_id'] = undefined;

/**
 * The timestamp of the trade
 * @member {Number} timestamp
 */
UserTrade.prototype['timestamp'] = undefined;

/**
 * The price of the trade
 * @member {Number} price
 */
UserTrade.prototype['price'] = undefined;

/**
 * Option implied volatility for the price (Option only)
 * @member {Number} iv
 */
UserTrade.prototype['iv'] = undefined;

/**
 * Unique (per currency) trade identifier
 * @member {String} trade_id
 */
UserTrade.prototype['trade_id'] = undefined;

/**
 * User's fee in units of the specified `fee_currency`
 * @member {Number} fee
 */
UserTrade.prototype['fee'] = undefined;

/**
 * Order type: `\"limit`, `\"market\"`, or `\"liquidation\"`
 * @member {module:model/UserTrade.OrderTypeEnum} order_type
 */
UserTrade.prototype['order_type'] = undefined;

/**
 * The sequence number of the trade within instrument
 * @member {Number} trade_seq
 */
UserTrade.prototype['trade_seq'] = undefined;

/**
 * `true` if the trade is against own order. This can only happen when your account has self-trading enabled. Contact an administrator if you think you need that
 * @member {Boolean} self_trade
 */
UserTrade.prototype['self_trade'] = undefined;

/**
 * order state, `\"open\"`, `\"filled\"`, `\"rejected\"`, `\"cancelled\"`, `\"untriggered\"` or `\"archive\"` (if order was archived)
 * @member {module:model/UserTrade.StateEnum} state
 */
UserTrade.prototype['state'] = undefined;

/**
 * User defined label (presented only when previously set for order by user)
 * @member {String} label
 */
UserTrade.prototype['label'] = undefined;

/**
 * Index Price at the moment of trade
 * @member {Number} index_price
 */
UserTrade.prototype['index_price'] = undefined;

/**
 * Trade amount. For perpetual and futures - in USD units, for options it is amount of corresponding cryptocurrency contracts, e.g., BTC or ETH.
 * @member {Number} amount
 */
UserTrade.prototype['amount'] = undefined;

/**
 * Unique instrument identifier
 * @member {String} instrument_name
 */
UserTrade.prototype['instrument_name'] = undefined;

/**
 * Direction of the \"tick\" (`0` = Plus Tick, `1` = Zero-Plus Tick, `2` = Minus Tick, `3` = Zero-Minus Tick).
 * @member {module:model/UserTrade.TickDirectionEnum} tick_direction
 */
UserTrade.prototype['tick_direction'] = undefined;

/**
 * Always `null`, except for a self-trade which is possible only if self-trading is switched on for the account (in that case this will be id of the maker order of the subscriber)
 * @member {String} matching_id
 */
UserTrade.prototype['matching_id'] = undefined;

/**
 * Describes what was role of users order: `\"M\"` when it was maker order, `\"T\"` when it was taker order
 * @member {module:model/UserTrade.LiquidityEnum} liquidity
 */
UserTrade.prototype['liquidity'] = undefined;





/**
 * Allowed values for the <code>direction</code> property.
 * @enum {String}
 * @readonly
 */
UserTrade['DirectionEnum'] = {

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
 * Allowed values for the <code>fee_currency</code> property.
 * @enum {String}
 * @readonly
 */
UserTrade['FeeCurrencyEnum'] = {

    /**
     * value: "BTC"
     * @const
     */
    "BTC": "BTC",

    /**
     * value: "ETH"
     * @const
     */
    "ETH": "ETH"
};


/**
 * Allowed values for the <code>order_type</code> property.
 * @enum {String}
 * @readonly
 */
UserTrade['OrderTypeEnum'] = {

    /**
     * value: "limit"
     * @const
     */
    "limit": "limit",

    /**
     * value: "market"
     * @const
     */
    "market": "market",

    /**
     * value: "liquidation"
     * @const
     */
    "liquidation": "liquidation"
};


/**
 * Allowed values for the <code>state</code> property.
 * @enum {String}
 * @readonly
 */
UserTrade['StateEnum'] = {

    /**
     * value: "open"
     * @const
     */
    "open": "open",

    /**
     * value: "filled"
     * @const
     */
    "filled": "filled",

    /**
     * value: "rejected"
     * @const
     */
    "rejected": "rejected",

    /**
     * value: "cancelled"
     * @const
     */
    "cancelled": "cancelled",

    /**
     * value: "untriggered"
     * @const
     */
    "untriggered": "untriggered",

    /**
     * value: "archive"
     * @const
     */
    "archive": "archive"
};


/**
 * Allowed values for the <code>tick_direction</code> property.
 * @enum {Number}
 * @readonly
 */
UserTrade['TickDirectionEnum'] = {

    /**
     * value: 0
     * @const
     */
    "0": 0,

    /**
     * value: 1
     * @const
     */
    "1": 1,

    /**
     * value: 2
     * @const
     */
    "2": 2,

    /**
     * value: 3
     * @const
     */
    "3": 3
};


/**
 * Allowed values for the <code>liquidity</code> property.
 * @enum {String}
 * @readonly
 */
UserTrade['LiquidityEnum'] = {

    /**
     * value: "M"
     * @const
     */
    "M": "M",

    /**
     * value: "T"
     * @const
     */
    "T": "T"
};



export default UserTrade;

