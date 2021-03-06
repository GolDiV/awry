import rp from "request-promise-native";

/**
 * REST API Resource for interacting with ARI Stasis Applications.
 */
export default class ApplicationsAPI {
  /**
   * Create an instance of the Applications API client, providing access
   * to the `/applications` endpoint.
   *
   * @param {object} params
   * @param {string} params.username The username to send with the request.
   * @param {string} params.password The password to send with the request.
   * @param {string} params.baseUrl The base url, without trailing slash,
   *  of the root Asterisk ARI endpoint. i.e. 'http://myserver.local:8088/ari'.
   */
  constructor(params = {}) {
    const { username, password } = params;

    /** @private */
    this._baseUrl = params.baseUrl;

    /** @private */
    this._request = rp.defaults({
      auth: { username, password },
      json: true
    });
  }

  /**
   * GET /applications
   *
   * List all ARI applications registered in Asterisk.
   *
   * @returns {Promise.<Array.<Application>>} Resolves with all applications
   *  registered in Asterisk.
   */
  list() {
    return this._request({
      method: "GET",
      uri: `${this._baseUrl}/applications`
    });
  }

  /**
   * GET /applications/{applicationName}
   *
   * Retrieve a single ARI application's details.
   *
   * @param {object} params
   * @param {string} params.applicationName The name of the application to
   *  retrieve.
   * @returns {Promise.<Application>} Resolves to the application details
   *  matching the provided application name. Rejects if the application
   *  does not exist (404 status).
   */
  get(params = {}) {
    const { applicationName } = params;
    const app = encodeURIComponent(applicationName);

    return this._request({
      method: "GET",
      uri: `${this._baseUrl}/applications/${app}`
    });
  }

  /**
   * POST /applications/{applicationName}/subscription
   *
   * *Subscribing to all endpoints for a specific endpoint technology,
   * i.e. `eventSource: 'endpoint:PJSIP'`, was introduced in Asterisk 12.5*
   *
   * *Subscribing to all resources in an event source, i.e.
   * `eventSource: 'channels:'`, was introduced in Asterisk 13.6*
   *
   * @param {object} params
   * @param {string} params.applicationName The name of the application to
   *  register 1 or more subscriptions with.
   * @param {string|Array.<string>} params.eventSource The uri for the event
   *  source[s] to subscribe to. For channels, it is the `channelId`. For
   *  bridges, it is the `bridgeId`. For endpoints, it is the technology
   *  combined with the resource with a slash, i.e. 'PJSIP/6001'. For
   *  deviceState, it is the `deviceName`.
   * @returns {Promise.<Application>} Resolves to the application details
   *  matching the provided application name. Rejects if the application
   *  does not exist (404 status) or one of the provided eventSources does
   *  not exist (422 status).
   */
  subscribe(params = {}) {
    const { eventSource, applicationName } = params;
    const app = encodeURIComponent(applicationName);

    return this._request({
      method: "POST",
      uri: `${this._baseUrl}/applications/${app}/subscription`,
      qs: { eventSource: [].concat(eventSource).join(",") }
    });
  }

  /**
   * DELETE /applications/{applicationName}/subscription
   *
   * @param {object} params
   * @param {string} params.applicationName The name of the application to
   *  remove 1 or more subscriptions from.
   * @param {string|Array.<string>} params.eventSource The uri for the event
   *  source[s] to unsubscribe from. For channels, it is the `channelId`. For
   *  bridges, it is the `bridgeId`. For endpoints, it is the technology
   *  combined with the resource with a slash, i.e. 'PJSIP/6001'. For
   *  deviceState, it is the `deviceName`.
   * @returns {Promise.<Application>} Resolves to the application details
   *  matching the provided application name. Rejects if the application
   *  does not exist (404 status), the application is not currently
   *  subscribed to one of the provided eventSources (409), or one of the
   *  provided eventSources does not exist (422 status).
   */
  unsubscribe(params = {}) {
    const { eventSource, applicationName } = params;
    const app = encodeURIComponent(applicationName);

    return this._request({
      method: "DELETE",
      uri: `${this._baseUrl}/applications/${app}/subscription`,
      qs: { eventSource: [].concat(eventSource).join(",") }
    });
  }
}

/**
 * The Application model returned by Asterisk.
 *
 * @typedef {object} Application
 * @property {Array.<string>} bridge_ids The ids of bridges that this application is subscribed to.
 * @property {Array.<string>} channel_ids The ids of channels that this application is subscribed to.
 * @property {Array.<string>} device_names The names of devices that this application is subscribed to.
 * @property {Array.<string>} endpoint_ids The endpoints that this application is subscribed to, in the format `{tech}/{resource}` i.e. 'PJSIP/6001'.
 * @property {string} name The name of this application.
 */
