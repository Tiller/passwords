package com.stooit.securepasswordkeyboard;

import android.annotation.TargetApi;
import android.content.Context;
import android.content.ContextWrapper;
import android.inputmethodservice.KeyboardView;
import android.util.AttributeSet;

public class KeyboardViewFix extends KeyboardView {
    public static boolean inEditMode = true;

    @TargetApi(21) // Build.VERSION_CODES.L
    public KeyboardViewFix(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(inEditMode ? new ContextWrapperInner(context) : context, attrs, defStyleAttr, defStyleRes);
    }

    public KeyboardViewFix(Context context, AttributeSet attrs, int defStyleAttr) {
        super(inEditMode ? new ContextWrapperInner(context) : context, attrs, defStyleAttr);
    }

    public KeyboardViewFix(Context context, AttributeSet attrs) {
        super(inEditMode ? new ContextWrapperInner(context) : context, attrs);
    }

    public static class ContextWrapperInner extends ContextWrapper {
        Context base;
        public ContextWrapperInner(Context base) {
            super(base);
            this.base = base;
        }
        public Object getSystemService(String name) {
            return Context.AUDIO_SERVICE.equals(name) ? null : base.getSystemService(name);
        }
    }
}