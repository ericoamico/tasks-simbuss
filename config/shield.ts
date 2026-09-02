import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app.
   */
  csp: {
    /**
     * Enable the Content-Security-Policy header.
     */
    enabled: false,

    /**
     * Per-resource CSP directives.
     */
    directives: {},

    /**
     * Report violations without blocking resources.
     */
    reportOnly: false,
  },

  /**
   * Configure CSRF protection.
   */
  csrf: {
    /**
     * Enable CSRF protection for the web application.
     */
    enabled: true,

    /**
     * API routes are excluded from CSRF validation.
     *
     * The API will eventually use its own token-based
     * authentication instead of browser session authentication.
     */
    exceptRoutes: (ctx) => {
      return ctx.request.url().startsWith('/api/')
    },

    /**
     * Expose the encrypted XSRF-TOKEN cookie for
     * frontend HTTP clients.
     */
    enableXsrfCookie: true,

    /**
     * HTTP methods protected by CSRF validation.
     */
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Prevent the application from being embedded in iframes.
   */
  xFrame: {
    enabled: true,
    action: 'DENY',
  },

  /**
   * Force browsers to use HTTPS.
   */
  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  /**
   * Prevent MIME type sniffing.
   */
  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig