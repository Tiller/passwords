package com.stooit.securepasswordkeyboard;

import android.text.TextUtils;
import android.util.Base64;
import android.util.Log;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedList;
import java.util.List;

public class PasswordGenerator {
    final protected static char[] hexArray = "0123456789ABCDEF".toCharArray();

	public static String generate(final String masterPassword, final String user, final String domain, final int length) throws NoSuchAlgorithmException {
		final String cleanMasterPassword = masterPassword;
		final String cleanUser = user.replaceAll("\\s", "").toLowerCase();
		final String cleanDomain = domain.replaceAll("\\s", "").toLowerCase();
		final int cleanLength = Math.max(4, Math.min(length, 30));

		if (!cleanDomain.matches("([a-zA-Z0-9-]+)")) {
			throw new IllegalArgumentException("Invalid domain.");
		}

		final String salt = "$2a$10$" + hexSha512(cleanDomain + cleanUser + "ed6abeb33d6191a6acdc7f55ea93e0e2").substring(0, 21) + ".";
		final String key = cleanMasterPassword + cleanUser + ":" + cleanDomain;

		final String bcryptHashed = BCrypt.hashpw(key, salt);

		String hashed = b85Hash(bcryptHashed.substring(bcryptHashed.length() - 31)).substring(0, cleanLength);

		while (!validateB85Password(hashed)) {
			hashed = b85Hash(hashed).substring(0, cleanLength);
		}

		return hashed;
	}

	private static boolean validateB85Password(final String hashed) {
		return hashed.matches("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60]).*");
	}

	private static String b85Hash(final String s) throws NoSuchAlgorithmException {
		return ascii85(b64Sha512(s).getBytes());
	}

	private static String ascii85(final byte[] inputByte) {
		final int[] input = new int[inputByte.length];
		for (int i = 0; i < inputByte.length; i++) {
			input[i] = inputByte[i];
		}

		final int reminder = input.length % 4;
		final int length = input.length - reminder;
		final List<String> result = new LinkedList<>();

		c(input, length, result);

		if (reminder != 0) {
			final List<Integer> t = new LinkedList<>();
			for (int i = length; i < input.length; i++) {
				t.add(input[i]);
			}
			while (t.size() < 4) {
				t.add(0);
			}

			final int[] t2 = new int[t.size()];
			int idx = 0;
			for (final Integer i : t) {
				t2[idx++] = i;
			}
			c(t2, 4, result);

			String x = result.get(result.size() - 1);
			result.remove(result.size() - 1);

			if ("z".equals(x)) {
				x = "!!!!!";
			}

			result.add(x.substring(0, reminder + 1));
		}

		return TextUtils.join("", result);
	}

	private static void c(final int[] input, final int length, final List<String> result) {
		final int[] b = { 0, 0, 0, 0, 0 };

		for (int i = 0; i < length; i += 4) {
			int n = ((input[i] * 256 + input[i + 1]) * 256 + input[i + 2]) * 256 + input[i + 3];
			if (n == 0) {
				result.add("z");
			}
			else {
				for (int j = 0; j < 5; b[j++] = n % 85 + 33, n /= 85)
					;
			}

			result.add(String.valueOf(Character.toChars(b[4])) + String.valueOf(Character.toChars(b[3])) + String.valueOf(Character.toChars(b[2]))
					+ String.valueOf(Character.toChars(b[1])) + String.valueOf(Character.toChars(b[0])));
		}
	}

	private static String hexSha512(final String string) throws NoSuchAlgorithmException {
		final MessageDigest md = MessageDigest.getInstance("SHA-512");
		final byte[] crypt = md.digest(string.getBytes());

		return bytesToHex(crypt).toLowerCase();
	}

    public static String bytesToHex(byte[] bytes) {
        char[] hexChars = new char[bytes.length * 2];
        for ( int j = 0; j < bytes.length; j++ ) {
            int v = bytes[j] & 0xFF;
            hexChars[j * 2] = hexArray[v >>> 4];
            hexChars[j * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }

	private static String b64Sha512(final String string) throws NoSuchAlgorithmException {
		final MessageDigest md = MessageDigest.getInstance("SHA-512");
		final byte[] crypt = md.digest(string.getBytes());

		return Base64.encodeToString(crypt, Base64.DEFAULT).replace('+', '9').replace('=', 'A').replace('/', '8');
	}
}
