// ==UserScript==
// @name        SecurePasswords
// @namespace   stooit
// @include     *
// @version     1
// @require     jquery.js
// @require     typeahead.js
// @require     bCrypt.js
// @grant       GM_addStyle
// ==/UserScript==
var deja = false;

var $output, $user, $phrase, $domain, $length, $info, $help;

var win = ' <div class="pwdlogin" style="width: 300px;"> <div class="pwdlogin-screen" style="background-color: #FFF; padding: 20px; border-radius: 10px; border: 5px solid #3498DB;"> <div class="pwdapp-title" style="text-align: center; color: #777; font-size: 12px; text-transform: uppercase; font-family: courier;"></div> <div class="pwdlogin-form" style="text-align: center;"> <div class="pwdcontrol-group" style="margin-bottom: 10px;"> <input autocorrect="off" style="text-align: center; background-color: #ECF0F1; border: 2px solid transparent; border-radius: 3px; font-size: 16px; font-weight: 200; padding: 10px 0; width: 250px; transition: border .5s;" spellcheck="false" type="text" class="pwdlogin-field pwduserInput pwdnotstored" value="" placeholder="username" id="pwdinputUser"> <label class="pwdlogin-field-icon pwdfui-user" for="login-name"></label> </div> <div class="pwdcontrol-group" style="margin-bottom: 10px;"> <input autocorrect="off" style="text-align: center; background-color: #ECF0F1; border: 2px solid transparent; border-radius: 3px; font-size: 16px; font-weight: 200; padding: 10px 0; width: 250px; transition: border .5s;" spellcheck="false" type="text" class="pwdlogin-field pwduserInput pwdtypeahead pwdnotstored" value="" placeholder="web domain" id="pwdinputDomain"> <label class="pwdlogin-field-icon pwdfui-lock" for="login-pass"></label> </div> <div class="pwdcontrol-group" style="margin-bottom: 10px;"> <input autocorrect="off" style="text-align: center; background-color: #ECF0F1; border: 2px solid transparent; border-radius: 3px; font-size: 16px; font-weight: 200; padding: 10px 0; width: 250px; transition: border .5s;" spellcheck="false" type="text" class="pwdlogin-field pwduserInput pwdstored" value="14" placeholder="password length" id="pwdinputLength"> <label class="pwdlogin-field-icon pwdfui-lock" for="login-pass"></label> </div> <div class="pwdcontrol-group" style="margin-bottom: 10px;"> <input autocorrect="off" style="text-align: center; background-color: #ECF0F1; border: 2px solid transparent; border-radius: 3px; font-size: 16px; font-weight: 200; padding: 10px 0; width: 250px; transition: border .5s;" spellcheck="false" type="password" class="pwdlogin-field pwduserInput pwdstored" value="" placeholder="secret key" id="pwdinputPhrase"> <label class="pwdlogin-field-icon pwdfui-lock" for="login-pass"></label> </div> <div class="pwdcontrol-group" style="margin-bottom: 10px; color: red; font-family: arial; font-size: 11px;" id="pwdoutputInfo"> </div> <div class="pwdcontrol-group" style="margin-bottom: 10px;"> <a class="pwdbtn pwdbtn-primary pwdbtn-large pwdbtn-block" href="#" id="pwdshowPassword" style="border: 2px solid transparent; background: #3498DB; color: #ffffff; font-size: 16px; line-height: 25px; padding: 10px 0; text-decoration: none; text-shadow: none; border-radius: 3px; box-shadow: none; transition: 0.25s; display: block; width: 250px; margin: 0 auto;">show password</a> </div> <div class="pwdcontrol-group" style="margin-bottom: 10px;"> <input autocorrect="off" size="30" spellcheck="false" style="display:none; background-color: #ff9;text-align: center; background-color: #ECF0F1; border: 2px solid transparent; border-radius: 3px; font-size: 16px; font-weight: 200; padding: 10px 0; width: 250px; transition: border .5s;" type="text" class="pwdlogin-field" value="" placeholder="your password" id="pwdoutputPassword"> </div><a href="#" id="pwdpwdclose">close</a></div> </div> </div>';

function findPos(obj){
    var curleft = curtop = 0;
    if (obj.offsetParent) {
        curleft = obj.offsetLeft
        curtop = obj.offsetTop
        while (obj = obj.offsetParent) {
            curleft += obj.offsetLeft
            curtop += obj.offsetTop
        }
    }
    return [curleft,curtop];
}

var workOn = function (elm) {
		if (typeof elm.dataset.pwddeja != 'undefined') {
			return;
		}
		elm.dataset.pwddeja = true;
        
        var pos = findPos(elm);
    
        elm.style.backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAMHSURBVHjadNNfTFtlGMfx73s4/QOlYy2sA5yy7pBpMoXMRLdBg3phspism5kX2xxDN53eMNhoa7zQxHhBaKeijbqZaBSY8Q/NGIneTR2ic/HCZJRospal0m2Cow0ttB3nwOtFA3EZPJdPnnzy5pffK6SUCCFYnuDpUB3gcTqdLqvZsg6gsHAnk0qlpoHRgM+fWL6VUiL+DwRPh6otFsvxnY/vEJqmoaoqAIZhcC12jZ9HRyXwScDn/2ct4Lm9e7zbJpOTxOMTuqHrcQDVZNIe3b7dpOs6o7/+Mh7w+QfXAtpbnz/s7D83gJTy7EwqPQ1Q6XS4XBtcrzQ3NzF04UIq4POH1wI621qPVHw7OIhqUrvVErUSwFg0ZtbZ7a97mj189c3XswGfv3dV4INwOHDwwIHSj8+eobamFpfLBcDU1BSGoeP17iUSieRPtLcHVwW6u7vfcG9xK949XqxW68peSkmhUODiDxeZmJhY6jjR8fY9wMmuU49t2ex+xuv1UiJs9J2JcfmnaQB2PeniyKv1LMp5hoeH+Ts5+X2oJ/j7XUBHZ6f/2X37yh55uIGjrZe5WVWDqHYUX3DjNrXpaT7r38VY9Crnh4Zy7/f2hlaAk12nnOW28vYX2tq4Hr/Dm+cKqFtrMJuUYg+WJPp4krday3BrFr7o6yM7lw2/9867KSGlxP9aYJOqlhxraWnhr7Sd72J1CKuZUrWYQd6QKPoCu90JHnJkufLbFeZzuU9DPcHkMlCRyWY6GxsbEJsbGLm6iVtLpZhKisAicJ+So2lbEhJjRMeilJXZekM9wdmVDF46/nKXo9JRXq09iLPlECOXZkn8KxEC6msEO5sqSI18SebWJPF4PD/weX/wrhC7/D4teSN5WKvXsD2wlbqn9oPZWvw1CwUSP0bIXP+TWCzGRtfGyEfhD6P39ODFY0d3Z+YyOxzO9SiKgr36fgBmbybI5fPMZ+ex2+x/DPT1D69apKqqDSbPE55GRVGeRmBeOUIgBIWZ2+mR8bHouGEszqXTM0tSSv4bAHVZgvCIptfJAAAAAElFTkSuQmCC')";
        elm.style.backgroundRepeat = 'no-repeat';
        elm.style.backgroundPosition = 'right center';


		var clk = function () {
				if (!deja) {
					deja = true;
				}
            
                var tmp;
                if (tmp = document.getElementById('pwdHolder')) {
                    tmp.parentNode.removeChild(tmp);
                }
            
				var hold = document.createElement('div');
                hold.id = 'pwdHolder';
				hold.style.position = 'absolute';
				hold.style.left = (pos[0] - (300 - elm.offsetWidth) / 2) + 'px';
				hold.style.top = (pos[1] + elm.offsetHeight) + 'px';
				hold.style.zIndex = 999999999;
				hold.innerHTML = win;

				document.body.appendChild(hold);

				document.getElementById('pwdinputPhrase').focus();

				document.getElementById('pwdinputPhrase').addEventListener('keydown', function (e) {
					if (e.keyCode == 13) {
						document.getElementById('pwdshowPassword').click();

						e.stopPropagation();
						e.preventDefault();
					}
				}, true);

				document.getElementById('pwdinputDomain').value = window.location.hostname.split('.').slice(-2, -1)[0];
				document.getElementById('pwdpwdclose').addEventListener('click', function (e) {
					document.body.removeChild(hold);

					e.preventDefault();
					e.stopPropagation();
				}, true);


				function generate_password(User, Domain, Phrase, Len) {
					// Min Length: 4; Max Length: 30 
					Len = (Len < 4) ? 4 : (Len > 30) ? 30 : Len;

					$output.val("Computing..").show();
					var salt = '$2a$10$' + hex_sha512(Domain + User + 'ed6abeb33d6191a6acdc7f55ea93e0e2').substr(0, 21) + '.';

					var key = Phrase + User + ":" + Domain;

					var bcrypt = new bCrypt();

					bcrypt.hashpw(key, salt, function (result) {

						var hashed = b85_hash(result.slice((result.length - 31), result.length)).substring(0, Len);

						while (!validate_b85_password(hashed)) {
							hashed = b85_hash(hashed).substring(0, Len);
						}
						
						$output.val(hashed).select();

						elm.value = hashed;
						document.body.removeChild(hold);

						elm.focus();
					}, function () {
						$output.val(Math.random());
					});

					return undefined;
				}


				$user = jQueryPwd('#pwdinputUser');
				$output = jQueryPwd('#pwdoutputPassword');
				$phrase = jQueryPwd('#pwdinputPhrase');
				$domain = jQueryPwd('#pwdinputDomain');
				$length = jQueryPwd('#pwdinputLength');
				$info = jQueryPwd('#pwdoutputInfo');
				$help = jQueryPwd('#pwdinfo');

				$phrase.val('');

				setTimeout(function () {
					$phrase.val('');
				}, 20);

				if (localStorage["inputLength"]) {
					jQueryPwd('#pwdinputLength').val(localStorage["inputLength"]);
				}

				if (localStorage["inputPhrase"]) {
					jQueryPwd('#pwdinputPhrase').val(localStorage["inputPhrase"]);
				}

				jQueryPwd('.stored').change(function () {
					localStorage[jQueryPwd(this).attr('id')] = jQueryPwd(this).val();
				});

				jQueryPwd('.deletecache').on('click', function () {
					localStorage.clear();
					jQueryPwd('.stored').val("");
					jQueryPwd('.notstored').val("");
					jQueryPwd('#pwdoutputPassword').hide();
					return false;
				});

				jQueryPwd("#pwdmodal-launcher").click(function (e) {
					$help.addClass("active");
					e.preventDefault();
				});

				jQueryPwd("#pwdmodal-footer").click(function (e) {
					$help.removeClass("active");
					e.preventDefault();
				});

				jQueryPwd('#pwdshowPassword').on('click', function (e) {
					var Phrase = $phrase.val();
					$phrase.val('');

					var User = $user.val().replace(/\s/g, '').toLowerCase();
					var Domain = $domain.val().replace(/\s/g, '').toLowerCase();
					$domain.val('');

					var Len = $length.val().replace(/\s/g, '');

					if (!User) {
						$user.css('background-color', '#ff9');
						$info.html("Please enter a user name").show().delay(2000).fadeOut('slow');
					} else if (!Domain) {
						$domain.css('background-color', '#ff9');
						$info.html("Please enter a valid domain name (e.g., google)").show().delay(2000).fadeOut('slow');
					} else if ((!Len) || (isNaN(Len / 1) == true)) {
						$length.css('background-color', '#ff9');
						$info.html("Please enter a valid numerical length for your password").show().delay(2000).fadeOut('slow');
					} else if (!Phrase) {
						$phrase.css('background-color', '#ff9');
						$info.html("Please enter your secret passphrase").show().delay(2000).fadeOut('slow');
					} else {
						var hostPattern = /^([a-zA-Z0-9-]+)$/;
						if (hostPattern.test(Domain) == false) {
							$domain.css('background-color', '#FF9');
							$info.html("Please enter a valid domain name but without using any prefixes or suffixes. For instance, enter google and not google.com or www.google.com or accounts.google.com").show().delay(2000).fadeOut('slow');
						} else {
							generate_password(User, Domain, Phrase, Len);
						}
					}

					e.preventDefault();

				});

				jQueryPwd('input.userInput').on('keydown change', function (e) {
					var key = e.which;
					if (e.type == 'change' || key == 8 || key == 32 || (key > 45 && key < 91) || (key > 95 && key < 112) || (key > 185 && key < 223)) {
						$output.hide();
						$phrase.css('background-color', '#ECF0F1');
						$user.css('background-color', '#ECF0F1');
						$domain.css('background-color', '#ECF0F1');
						$length.css('background-color', '#ECF0F1');
					} else if (key == 13) {
						jQueryPwd(this).blur();
						jQueryPwd('#pwdshowPassword').trigger('click');
						e.preventDefault();
					}
				});


				jQueryPwd("input.typeahead").typeahead({
					name: "domain",
					local: ["Amazon", "Apple", "Box", "Digg", "Disqus", "DreamHost", "Dribbble", "Dropbox", "eBay", "EverNote", "Facebook", "Flipboard", "FourSquare", "GetPocket", "Github", "GoDaddy", "Google", "Hulu", "IFTTT", "IMDB", "Instagram", "Instapaper", "Kickstarter", "LinkedIn", "MailChimp", "Netflix", "NYTimes", "Outlook", "Pandora", "PayPal", "Pinboard", "Pinterest", "Quora", "Readability", "Reddit", "Skype", "SlideShare", "Stack Overflow", "StumbleUpon", "TED", "Tumblr", "Tweetdeck", "Twitter", "Vimeo", "Wikipedia", "WordPress", "WSJ", "Yahoo", "Steam", "SensCritique", "Trillian", "FTP"]
				});
			};
    
		elm.addEventListener('keydown', function (e) {
			if (e.keyCode == 9 && this.value == '') {
				clk();

				e.stopPropagation();
				e.preventDefault();
			}
		}, true);

		//div.addEventListener('click', clk, true);
	};

window.addEventListener("load", function () {
	var passwds = document.querySelectorAll('input[type=password]');

	for (var i = 0; i < passwds.length; i++) {
		workOn(passwds[i]);
	}
}, true);

window.addEventListener("mousedown", function () {
	var passwds = document.querySelectorAll('input[type=password]');

	for (var i = 0; i < passwds.length; i++) {
		workOn(passwds[i]);
	}
}, true);


function clean(str) {
	var sentence = str.replace(/\w\S*/g, function (txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
	return sentence.replace(/\s/g, '');
}


function validate_b85_password(password) {
	return (
	password.search(/[0-9]/) >= 0 && password.search(/[A-Z]/) >= 0 && password.search(/[a-z]/) >= 0 && password.search(/[\x21-\x2F\x3A-\x40\x5B-\x60]/) >= 0) ? true : false;
}

function b85_hash(s) {
	return ascii85(jQueryPwd.map(b64_sha512(s).split(''), function (val) {
		return val.charCodeAt(0);
	}));
}

var c = function (input, length, result) {
		var i, j, n, b = [0, 0, 0, 0, 0];
		for (i = 0; i < length; i += 4) {
			n = ((input[i] * 256 + input[i + 1]) * 256 + input[i + 2]) * 256 + input[i + 3];
			if (!n) {
				result.push("z");
			} else {
				for (j = 0; j < 5; b[j++] = n % 85 + 33, n = Math.floor(n / 85));
			}
			result.push(String.fromCharCode(b[4], b[3], b[2], b[1], b[0]));
		}
	};

var ascii85 = function (input) {
		// summary: encodes input data in ascii85 string
		// input: Array: an array of numbers (0-255) to encode
		var result = [],
			reminder = input.length % 4,
			length = input.length - reminder;
		c(input, length, result);
		if (reminder) {
			var t = input.slice(length);
			while (t.length < 4) {
				t.push(0);
			}
			c(t, 4, result);
			var x = result.pop();
			if (x == "z") {
				x = "!!!!!";
			}
			result.push(x.substr(0, reminder + 1));
		}
		return result.join(""); // String
	};
               