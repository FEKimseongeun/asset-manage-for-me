import sys
import json
import FinanceDataReader as fdr

def fetch_recent_open(stock_code):
    try:
        price_df = fdr.DataReader(stock_code)
        recent_open = price_df['Open'].iloc[-1]

        # result = {
        #     "stock_code": stock_code,
        #     "recent_open": recent_open
        # }
        result = recent_open
        return result

    except Exception as e:
        result = {"error": str(e)}

    print(json.dumps(result))
    sys.stdout.flush()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        stock_code = sys.argv[1]
        st_price=fetch_recent_open(stock_code)
        print(st_price)
    else:
        print(json.dumps({"error": "No stock code provided"}))
