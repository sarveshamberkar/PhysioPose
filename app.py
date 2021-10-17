from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@app.route('/squat', methods=['GET', 'POST'])
def squat():
    return render_template('squat.html')


@app.route('/sidebend', methods=['GET', 'POST'])
def sidebend():
    return render_template('sidebends.html')


@app.route('/sidelunges', methods=['GET', 'POST'])
def sidelunges():
    return render_template('sidelunge.html')


if __name__ == '__main__':
    app.run(debug=True)
