module.exports = {
  action: 'DescribeCommonAttachments',
  getQueryParams: function(options) {
    let limit;
    if (options.limit) {
      limit = options.limit;
    } else {
      limit = options.ca ? 50 : 100;
    }
    let attachment_ids = options.ca ? [options.ca] : [];

    return {
      verbose: 1,
      zone: options.zone,
      action: this.action,
      offset: 0,
      limit: limit,
      attachment_ids: attachment_ids
    };
  }
};
