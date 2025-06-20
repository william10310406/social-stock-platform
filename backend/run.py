from app import create_app, socketio

app = create_app()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)

# The app object that Gunicorn will use is the one wrapped by SocketIO
# We need to run the app through socketio.run() for websocket support,
# but gunicorn handles that with its worker. The 'run:app' in docker-compose
# is now ambiguous. We should be running 'run:socketio'.
# However, gunicorn with eventlet can run the flask app directly and SocketIO will patch it.
# Let's run the 'app' object directly first.