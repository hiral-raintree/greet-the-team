import logging

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

def index_handler(event, context):
  logger.info("Hello Team, Do your best & leave the rest to God !")

  return {
    "statusCode": 200
  }

if __name__ == '__main__':
  print(index_handler(None, None))