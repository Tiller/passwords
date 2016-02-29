package com.stooit.securepasswordkeyboard;
import android.inputmethodservice.InputMethodService;
import android.inputmethodservice.Keyboard;
import android.inputmethodservice.KeyboardView;
import android.inputmethodservice.KeyboardView.OnKeyboardActionListener;
import android.media.AudioManager;
import android.util.Log;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.widget.EditText;
import android.widget.LinearLayout;

public class SecurePasswordKeyboard extends InputMethodService
	implements OnKeyboardActionListener{

    /** the main layout. */
    private LinearLayout layout;

    /** the keyboard view's part. */
    private KeyboardView kv;

    /** the azerty keyboard. */
    private Keyboard azertyKeyboard;

    /** the symbol keyboard. */
    private Keyboard symbolKeyboard;

    /** the symbol shift keyboard. */
    private Keyboard symbolShiftKeyboard;

    /** the 'user' text field. */
    private EditText editUser;

    /** the 'domain' text field. */
    private EditText editDomain;

    /** the 'length' text field. */
    private EditText editLength;

    /** the 'master password' text field. */
    private EditText editMasterPassword;

    /** the currently focused text field. */
    private EditText focusedEdit;

    /** whether the symbols are selected. */
    private boolean isSymbol;

    /** the caps state (0=off, 1=on, 2=permanent). */
    private int caps = 0;

    /** listener keeping track of the select text field. */
    private View.OnFocusChangeListener focusListener = new View.OnFocusChangeListener() {
        @Override
        public void onFocusChange(View view, boolean hasFocus) {
            if (view instanceof EditText && hasFocus) {
                focusedEdit = (EditText) view;
            } else {
                focusedEdit = null;
            }
        }
    };
	
	@Override
	public View onCreateInputView() {
		layout = (LinearLayout) getLayoutInflater().inflate(R.layout.main, null);

        editUser = (EditText) layout.findViewById(R.id.user);
        editDomain = (EditText) layout.findViewById(R.id.domain);
        editLength = (EditText) layout.findViewById(R.id.length);
        editMasterPassword = (EditText) layout.findViewById(R.id.masterPassword);

        editUser.setOnFocusChangeListener(focusListener);
        editDomain.setOnFocusChangeListener(focusListener);
        editLength.setOnFocusChangeListener(focusListener);
        editMasterPassword.setOnFocusChangeListener(focusListener);

		kv = (KeyboardView)layout.findViewById(R.id.keyboard);
        azertyKeyboard = new Keyboard(this, R.xml.azerty);
        symbolKeyboard = new Keyboard(this, R.xml.symbol);
        symbolShiftKeyboard = new Keyboard(this, R.xml.symbol_shift);

		kv.setKeyboard(azertyKeyboard);
		kv.setOnKeyboardActionListener(this);
		kv.invalidateAllKeys();
		return layout;
	}

	@Override
	public void onKey(int primaryCode, int[] keyCodes) {
        final InputConnection ic = getCurrentInputConnection();

		switch(primaryCode){
        case -2:
            isSymbol = !isSymbol;

            caps = 0;
            updateKeyboard();
            break;

		case Keyboard.KEYCODE_DELETE :
            if (focusedEdit != null) {
                final int start = focusedEdit.getSelectionStart();
                final int end = focusedEdit.getSelectionEnd();

                if (start != end) {
                    focusedEdit.getText().delete(start, end);
                } else if (start > 0) {
                    focusedEdit.getText().delete(start-1, start);
                }
            }
			break;

		case Keyboard.KEYCODE_SHIFT:
			caps = (caps + 1) % 3;
            updateKeyboard();
			break;
		case Keyboard.KEYCODE_DONE:
            try {
                final String pwd = PasswordGenerator.generate(editMasterPassword.getText().toString(), editUser.getText().toString(), editDomain.getText().toString(), Integer.parseInt(editLength.getText().toString()));

                ic.commitText(pwd, pwd.length());

                editMasterPassword.getText().clear();
            } catch (final Exception e) {
                Log.e("SPKeyboard", e.getMessage(), e);
            }
			break;
		default:
			char code = (char)primaryCode;
			if(Character.isLetter(code) && caps > 0){
				code = Character.toUpperCase(code);
			}

            if (focusedEdit != null) {
                focusedEdit.getText().delete(focusedEdit.getSelectionStart(), focusedEdit.getSelectionEnd());
                focusedEdit.getText().insert(focusedEdit.getSelectionStart(), String.valueOf(code));
            }

            if (caps == 1) {
                caps = 0;
                updateKeyboard();
            }
		}
	}

    private void updateKeyboard() {
        azertyKeyboard.setShifted(caps > 0);
        symbolKeyboard.setShifted(caps > 0);
        symbolShiftKeyboard.setShifted(caps > 0);
        kv.invalidateAllKeys();

        if (isSymbol) {
            if (caps > 0) {
                kv.setKeyboard(symbolShiftKeyboard);
            } else {
                kv.setKeyboard(symbolKeyboard);
            }
        } else {
            kv.setKeyboard(azertyKeyboard);
        }
    }

	@Override
	public void onPress(int primaryCode) {
	}

	@Override
	public void onRelease(int primaryCode) { 			
	}

	@Override
	public void onText(CharSequence text) {		
	}

    @Override
	public void swipeDown() {	
	}

	@Override
	public void swipeLeft() {
	}

	@Override
	public void swipeRight() {
	}

	@Override
	public void swipeUp() {
	}
}
