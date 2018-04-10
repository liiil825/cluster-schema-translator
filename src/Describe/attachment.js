module.exports = {
  action: 'DescribeCommonAttachments',
  getQueryParams: function(options) {
    return {
      verbose: 1,
      zone: options.zone,
      action: this.action,
      offset: 0,
      limit: 50, // todo: reduce limit
      attachment_ids: options.ca ? [options.ca] : []
    }
  }
};
