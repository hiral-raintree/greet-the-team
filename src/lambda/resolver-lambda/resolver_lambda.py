import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def index_handler(event, context):
  logger.info("Reolver is invoked by AppSync API successfully, Congratulations !!!")
  logger.info("Event: ", event)

  return {
    "statusCode": 200
  }

if __name__ == '__main__':
  print(index_handler(None, None))