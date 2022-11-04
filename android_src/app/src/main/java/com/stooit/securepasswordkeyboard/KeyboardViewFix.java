package com.stooit.securepasswordkeyboard;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.ContextWrapper;
import android.inputmethodservice.KeyboardView;
import android.util.AttributeSet;

public class KeyboardViewFix extends KeyboardView {
    public static boolean inEditMode = true;

    @TargetApi(33) // Build.VERSION_CODES.L
    public KeyboardViewFix(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    public KeyboardViewFix(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public KeyboardViewFix(Context context, AttributeSet attrs) {
        super(context, attrs);
    }
}