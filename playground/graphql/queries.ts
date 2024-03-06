export const PING_QUERY = `{
  serverStatus {
    status
  }
}`;

export const URLS_QUERY = `{
  terminalConfiguration {
    boxUrl {
      http
    }
  }
}`;

export const TERMINAL_CONTEXT_QUERY = `{
  terminalContext {
    companyId
    storeId
    terminalId
  }
}`;
